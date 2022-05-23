import _ from 'lodash';
import { FunctionComponent } from 'react';
import { useRouter } from 'next/router';
import { Grid, Image, List, Loader, Label, Container, Message, Button, Icon } from 'semantic-ui-react';
import useSWR from 'swr';
import CollectionFileButton from './search.collectionFilesButton';
import CollectionImageThumbnail from './search.collectionImageThumbnail';
import CollectionMapThumbnail from './search.collectionMapThumbnail';
import { itemFieldNames } from '../common/items';
import Link from '../components/link';

const useTerms = (types, terms) => {
		const { data } = useSWR(
		() => {
			return { url: `/api/es?search`, payload: {
				sortOrder: 'ids asc',
				terms,
				types,
			}};
		},
		async ({ url, payload }) => {
			const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
			const data = await res.json();

			if (res.status !== 200) {
				throw new Error(data.message)
			}
			return data
		}
	);
	return data && data.hits.hits.map(x => x._source);
}

const useSearch = (types, searchString) => {
		const { data } = useSWR(
		() => {
			return { url: `/api/es?search`, payload: {
				sortOrder: 'ids asc',
				searchString,
				types,
			}};
		},
		async ({ url, payload }) => {
			const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
			const data = await res.json();

			if (res.status !== 200) {
				throw new Error(data.message)
			}
			return data
		}
	);
	return data && data.hits.hits.map(x => x._source);
}

export const SearchLandingPage: FunctionComponent = () => {
	const { asPath } = useRouter();
	const osuID = asPath.substring(1);
	
	const coreDiveDocs = useTerms(['core', 'dive'], {'_osuid.keyword': [osuID]});
	const sectionDocs =  useTerms(['section'], coreDiveDocs && coreDiveDocs.length && coreDiveDocs[0]._coreUUID && { '_coreUUID.keyword': [coreDiveDocs[0]._coreUUID] } || undefined);
	const diveSampleDocs = useTerms(['diveSample'], coreDiveDocs && coreDiveDocs.length && coreDiveDocs[0]._diveUUID && { '_diveUUID.keyword': [coreDiveDocs[0]._diveUUID] } || undefined);
	const cruiseDocs =  useTerms(['cruise'], coreDiveDocs && coreDiveDocs.length && coreDiveDocs[0]._cruiseUUID && { '_cruiseUUID.keyword': [coreDiveDocs[0]._cruiseUUID] } || undefined);
	const otherCoreDiveDocs =  useSearch(['core', 'dive'], cruiseDocs && cruiseDocs.length && cruiseDocs[0]._cruiseID && `OSU-${cruiseDocs[0]._cruiseID}` || undefined);
	
	const osuIDs = {};
	return <>
			<h1>{osuID}</h1>
			<Grid columns={2}>
				<Grid.Column>
					{coreDiveDocs && coreDiveDocs.length && _.keys(itemFieldNames).map((label, i) =>
						label[0] != '_' &&
						coreDiveDocs[0][label.replace('.substring', '')] ? (
							<div
								key={i}
							>
								<b>{itemFieldNames[label]}:</b> {coreDiveDocs[0][label.replace('.substring', '')]} 
							</div>
						) : undefined
					) || undefined}
					<br/>
					{cruiseDocs && cruiseDocs.length && _.keys(itemFieldNames).map((label, i) =>
						label[0] != '_' &&
						cruiseDocs[0][label.replace('.substring', '')] ? (
							<div
								key={i}
							>
								<b>Cruise {itemFieldNames[label]}:</b> {cruiseDocs[0][label.replace('.substring', '')]} 
							</div>
						) : undefined
					) || undefined}
				</Grid.Column>
				<Grid.Column>
					{coreDiveDocs && coreDiveDocs.length && coreDiveDocs[0].latitudeStart && coreDiveDocs[0].longitudeStart && <>
						<Image bordered size='tiny' floated='right'
							style={{ border: '2px solid white', zIndex: 1, margin: '-2px -2px 0 -100%' }}
							src={
								`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${coreDiveDocs[0].latitudeStart},${coreDiveDocs[0].longitudeStart}&` +
								`zoom=0&size=160x160&markers=color:0xD73F09|${coreDiveDocs[0].latitudeStart},${coreDiveDocs[0].longitudeStart}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
							}
						/>
						<Image size='medium' floated='right'
							src={
								`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${coreDiveDocs[0].latitudeStart},${coreDiveDocs[0].longitudeStart}&` +
								`zoom=7&size=640x640&markers=color:0xD73F09|${coreDiveDocs[0].latitudeStart},${coreDiveDocs[0].longitudeStart}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
							}
						/>
					</> || undefined }
				</Grid.Column>
			</Grid>
			{cruiseDocs && cruiseDocs.length && cruiseDocs[0]._cruiseID && 
				<List divided>
					<List.Item>
						<List.Content style={{ padding: '.25rem 0 .5rem' }}>
							<CollectionFileButton name='Cruise Report' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/cruisereport/OSU-${cruiseDocs[0]._cruiseID}-cruisereport.pdf`} />
							<CollectionFileButton name='Publications' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/publications/OSU-${cruiseDocs[0]._cruiseID}-publications.pdf`} />
							<CollectionFileButton name='Coring Data Sheet' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/coringdatasheet/OSU-${cruiseDocs[0]._cruiseID}-${coreDiveDocs[0]._coreNumber}-coringdatasheet.pdf`} />
							<CollectionFileButton name='MST Data' icon='file alternate outline' file={`${cruiseDocs[0]._cruiseID}/mstdata/${coreDiveDocs[0]._osuid}-mstdata.dat`} />
						</List.Content>
					</List.Item>
				</List> || undefined
			}
			{cruiseDocs && cruiseDocs.length && cruiseDocs[0]._cruiseID && sectionDocs && sectionDocs.length &&
				<>
					<h3>Core Sections</h3>
					<hr />
					<List divided>
						{ sectionDocs.map(doc => !osuIDs[doc._osuid] && (osuIDs[doc._osuid] = 1) &&
							<List.Item key={doc._uuid}>
								<List.Content style={{ padding: '.25rem 0 .5rem' }}>
									<List.Header as='h3'>{doc._osuid}</List.Header>
									<List.Description>
										{_.keys(itemFieldNames).map((label, i) =>
											label[0] !== '_' &&
												label !== 'id.substring' &&
												doc[label.replace('.substring', '')]  ? (
												<Label
													key={i}
													basic
													circular
													size='tiny'
													style={{
														margin: '.5rem .5rem 0 0',
													}}
												>
													&nbsp;&nbsp;{itemFieldNames[label]}:
													<Label.Detail>
														{doc[label.replace('.substring', '')]}
													</Label.Detail>
												</Label>
											) : undefined
										)}
									</List.Description>
									<List.Description style={{ margin: '0.5rem 0 -0.5rem'}}>
										<CollectionMapThumbnail lat={doc.latitudeStart} lon={doc.longitudeStart} />
										<CollectionImageThumbnail name='Section Image' file={`${cruiseDocs[0]._cruiseID}/image/${doc._osuid}-image.tif`} />
										<CollectionImageThumbnail name='Section Image' file={`${cruiseDocs[0]._cruiseID}/image/${doc._osuid}-image.tiff`} />
										<CollectionImageThumbnail name='Section Image' file={`${cruiseDocs[0]._cruiseID}/image/${doc._osuid}-image.jpeg`} />
										<CollectionImageThumbnail name='Section Image' file={`${cruiseDocs[0]._cruiseID}/image/${doc._osuid}-image.bmp`} />
										<CollectionImageThumbnail name='Section X-Ray' file={`${cruiseDocs[0]._cruiseID}/xray/${doc._osuid}-itraxxray.tif`} />
										<CollectionFileButton name='Core Description' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/coredescription/${doc._osuid}-coredescription.pdf`} />
										<CollectionFileButton name='Archive IGSN' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/igsnsheet/${doc._osuid}A.pdf`} />
										<CollectionFileButton name='Working IGSN' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/igsnsheet/${doc._osuid}W.pdf`} />
									</List.Description>
								</List.Content>
							</List.Item>
						)}
					</List>
				</>
			}
			{cruiseDocs && cruiseDocs.length && diveSampleDocs && diveSampleDocs.length &&
				<>
					<h3>Dive Samples</h3>
					<hr />
					<List divided>
						{ diveSampleDocs.map(doc => !osuIDs[doc._osuid] && (osuIDs[doc._osuid] = 1) &&
							<List.Item key={doc._uuid}>
								<List.Content style={{ padding: '.25rem 0 .5rem' }}>
									<List.Header as='h3'>{doc._osuid}</List.Header>
									<List.Description>
										{_.keys(itemFieldNames).map((label, i) =>
											label[0] !== '_' &&
												label !== 'id.substring' &&
												doc[label.replace('.substring', '')]  ? (
												<Label
													key={i}
													basic
													circular
													size='tiny'
													style={{
														margin: '.5rem .5rem 0 0',
													}}
												>
													&nbsp;&nbsp;{itemFieldNames[label]}:
													<Label.Detail>
														{doc[label.replace('.substring', '')]}
													</Label.Detail>
												</Label>
											) : undefined
										)}
									</List.Description>
									<List.Description style={{ margin: '0.5rem 0 -0.5rem'}}>
										<CollectionMapThumbnail lat={doc.latitudeStart} lon={doc.longitudeStart} />
										{_.range(1, 50).map(x =>
											<CollectionImageThumbnail
												key={`${x}`}
												name={x === 1 && 'Sample Image' || undefined}
												file={`${cruiseDocs[0]._cruiseID}/image/${osuID.replace('OSU-', '')}-${doc.id}_${x}.JPG`}
											/>
										)}
									</List.Description>
								</List.Content>	
							</List.Item>
						)}
					</List>
				</>
			}
			{ coreDiveDocs && coreDiveDocs.length && coreDiveDocs[0]._cruiseID && otherCoreDiveDocs && otherCoreDiveDocs.length && otherCoreDiveDocs[0]._cruiseID &&
				<>
					<h3>Other {coreDiveDocs[0]._docType === 'core' ? 'Core' : 'Dive'}s from Cruise {coreDiveDocs[0]._cruiseID}</h3>
					<hr />
					<List divided>
						{ otherCoreDiveDocs.map(doc => doc._osuid !== osuID && !osuIDs[doc._osuid] && (osuIDs[doc._osuid] = 1) &&
							<List.Item key={doc._uuid}>
								<Link href={`${doc._osuid}`}>
									<List.Content style={{ padding: '.25rem 0 .5rem' }}>
										<List.Header as='h3'>{doc._osuid}</List.Header>
										<List.Description>
											{_.keys(itemFieldNames).map((label, i) =>
												label[0] !== '_' &&
													label !== 'id.substring' &&
													doc[label.replace('.substring', '')]  ? (
													<Label
														key={i}
														basic
														circular
														size='tiny'
														style={{
															margin: '.5rem .5rem 0 0',
														}}
													>
														&nbsp;&nbsp;{itemFieldNames[label]}:
														<Label.Detail>
															{doc[label.replace('.substring', '')]}
														</Label.Detail>
													</Label>
												) : undefined
											)}
										</List.Description>
									</List.Content>
								</Link>
							</List.Item>
						)}
					</List>
				</> || undefined
			}
			{coreDiveDocs === undefined && <Loader active /> || undefined}
			{coreDiveDocs && coreDiveDocs.length == 0 &&
				<Container style={{ display: 'flex', height: '50vh' }}>
					<Message
						error
						size='large'
						icon='warning'
						header='Unknown OSU ID'
						content={<>
							Please try searching for a different item in the collections.
							<br/>
							<br/>
							<a href='/search'>
								<Button icon fluid>
									<Icon name='search' />
									Search
								</Button>
							</a>
						</>}
						style={{ margin: 'auto', width: 'auto' }}
					/>
				</Container> || undefined
			}
	</>;
};

export default SearchLandingPage;