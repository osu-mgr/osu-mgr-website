import _ from 'lodash';
import { FunctionComponent } from 'react';
import { useRouter } from 'next/router';
import { Grid, Image, List, Loader, Label, Container, Message, Button, Icon, Menu } from 'semantic-ui-react';
import useSWR from 'swr';
import CollectionFileButton from './search.collectionFilesButton';
import CollectionImageThumbnail from './search.collectionImageThumbnail';
import CollectionMapThumbnail from './search.collectionMapThumbnail';
import { itemFieldNames, formatField } from '../common/items';
import Link from '../components/link';

const useTerms = (types, terms) => {
		const { data } = useSWR(
		() => {
			return { url: `/api/es?search`, payload: {
				sortOrder: 'ids asc',
				terms,
				types,
				size: 1000
			}};
		},
		async ({ url, payload }) => {
			const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
			const data = await res.json();

			if (res.status !== 200) {
				throw new Error(data.message)
			}
			return data;
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
				size: 1000
			}};
		},
		async ({ url, payload }) => {
			const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
			const data = await res.json();

			if (res.status !== 200) {
				throw new Error(data.message)
			}
			return data;
		}
	);
	return data && data.hits.hits.map(x => x._source);
}

const FieldLabel: FunctionComponent<{ doc, label }> = ({ doc, label }) => {
	if (label[0] !== '_' &&
		label !== 'id.substring' &&
		itemFieldNames[label] &&
		doc[label.replace('.substring', '')])
		return <Label
			basic
			circular
			size='tiny'
			style={{
				margin: '.5rem .5rem 0 0',
			}}
		>
			&nbsp;&nbsp;{itemFieldNames[label]}:
			<Label.Detail>
				{formatField(doc, label)}
			</Label.Detail>
		</Label>;
	return null;
}

const CruiseLandingPage: FunctionComponent<{ cruiseDoc }> = ({ cruiseDoc }) => {
	const osuID = cruiseDoc._osuid;
	const coreDocs = useSearch(['core'], cruiseDoc._cruiseID && `OSU-${cruiseDoc._cruiseID}` || undefined);
	const diveDocs = useSearch(['dive'], cruiseDoc._cruiseID && `OSU-${cruiseDoc._cruiseID}` || undefined);
	const diveSampleDocs = useSearch(['diveSample'], cruiseDoc._cruiseID && `OSU-${cruiseDoc._cruiseID}` || undefined);
	
	const mapMarkers = [];
	[].concat(coreDocs).concat(diveSampleDocs).forEach(doc => {
		if (doc && doc.latitudeStart !== undefined &&
				doc.longitudeStart !== undefined) {
			mapMarkers.push({
				lat: doc.latitudeStart,
				lon: doc.longitudeStart
			});
		}
	})

	const osuIDs = {};
	return <>
		<Menu secondary pointing stackable>
			<Menu.Item>
				<a href='/search'>
					Return to Search
				</a>
			</Menu.Item>
			<Menu.Item active>
				<p>
					Cruise/Program {osuID.replace('OSU-', '')}
				</p>
			</Menu.Item>
		</Menu>
		
		<h1>{osuID.replace('OSU-', '')}</h1>
			<Grid columns={2}>
				<Grid.Column>
					{_.keys(itemFieldNames).map((label, i) =>
						label[0] != '_' &&
						cruiseDoc[label.replace('.substring', '')] ? (
							<div
								key={i}
							>
								<b>Cruise {itemFieldNames[label]}:</b> {formatField(cruiseDoc, label)} 
							</div>
						) : undefined
					) || undefined}
					{cruiseDoc._cruiseID && 
						<List divided>
							<List.Item>
								<List.Content style={{ padding: '.25rem 0 .5rem' }}>
									<CollectionFileButton name='Cruise Report' icon='file pdf outline' file={`${cruiseDoc._cruiseID}/cruisereport/OSU-${cruiseDoc._cruiseID}-cruisereport.pdf`} />
									<CollectionFileButton name='Publications' icon='file pdf outline' file={`${cruiseDoc._cruiseID}/publications/OSU-${cruiseDoc._cruiseID}-publications.pdf`} />
								</List.Content>
							</List.Item>
						</List> || undefined
					}
				</Grid.Column>
				<Grid.Column>
					{mapMarkers.length && <>
						<Link href={`/map?find=${osuID}`}>
							<Image bordered size='tiny' floated='right'
								style={{ border: '2px solid white', zIndex: 1, margin: '-2px -2px 0 -100%' }}
								src={
									`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${mapMarkers[0].lat},${mapMarkers[0].lon}&` +
									`zoom=0&size=160x160&markers=color:0xD73F09|${mapMarkers.map(x => x.lat + ',' + x.lon).join('|')}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
								}
							/>
							<Image size='medium' floated='right'
								src={
									`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${mapMarkers[0].lat},${mapMarkers[0].lon}&` +
									`zoom=7&size=640x640&markers=color:0xD73F09|${mapMarkers.map(x => x.lat + ',' + x.lon).join('|')}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
								}
							/>
						</Link>
					</> || undefined }
				</Grid.Column>
			</Grid>
			{ coreDocs && coreDocs.length &&
				<>
					<h3>Cores from Cruise/Program {cruiseDoc._cruiseID}</h3>
					<hr />
					<List divided>
						{ coreDocs.map(doc => doc._osuid !== osuID && !osuIDs[doc._osuid] && (osuIDs[doc._osuid] = 1) &&
							<List.Item key={doc._uuid}>
								<Link href={`${doc._osuid}`}>
									<List.Content style={{ padding: '.25rem 0 .5rem' }}>
										<List.Header as='h3'>{doc._osuid}</List.Header>
										<List.Description>
											{_.keys(itemFieldNames).map((label, i) => <FieldLabel
												key={i}
												label={label}
												doc={doc} />)}
										</List.Description>
									</List.Content>
								</Link>
							</List.Item>
						)}
					</List>
				</> || undefined
			}
			{ diveDocs && diveDocs.length &&
				<>
					<h3>Dives from Cruise/Program {cruiseDoc._cruiseID}</h3>
					<hr />
					<List divided>
						{ diveDocs.map(doc => doc._osuid !== osuID && !osuIDs[doc._osuid] && (osuIDs[doc._osuid] = 1) &&
							<List.Item key={doc._uuid}>
								<Link href={`${doc._osuid}`}>
									<List.Content style={{ padding: '.25rem 0 .5rem' }}>
										<List.Header as='h3'>{doc._osuid}</List.Header>
										<List.Description>
											{_.keys(itemFieldNames).map((label, i) => <FieldLabel
												key={i}
												label={label}
												doc={doc} />)}
										</List.Description>
									</List.Content>
								</Link>
							</List.Item>
						)}
					</List>
				</> || undefined
			}
	</>;
}

const CoreLandingPage: FunctionComponent<{ coreDoc }> = ({ coreDoc }) => {
	const osuID = coreDoc._osuid;
	const cruiseDocs =  useTerms(['cruise'], coreDoc._cruiseUUID && { '_cruiseUUID.keyword': [coreDoc._cruiseUUID] } || undefined);
	const sectionDocs =  useTerms(['section'], coreDoc._coreUUID && { '_coreUUID.keyword': [coreDoc._coreUUID] } || undefined);
	const otherCoreDocs = useTerms(['core'], coreDoc._cruiseUUID && { '_cruiseUUID.keyword': [coreDoc._cruiseUUID] } || undefined);
	
	const osuIDs = {};
	return <>
		<Menu secondary pointing stackable>
			<Menu.Item>
				<a href='/search'>
					Return to Search
				</a>
			</Menu.Item>
			{cruiseDocs && cruiseDocs[0] &&
				<Menu.Item>
					<a href={`/${cruiseDocs[0]._osuid}`}>
						Cruise/Program {cruiseDocs[0]._osuid.replace('OSU-', '')}
					</a>
				</Menu.Item> || undefined
			}
			<Menu.Item active>
				<p>
					Core {osuID.replace('OSU-', '')}
				</p>
			</Menu.Item>
		</Menu>

		<h1>{osuID.replace('OSU-', '')}</h1>
			<Grid columns={2}>
				<Grid.Column>
					{_.keys(itemFieldNames).map((label, i) =>
						label[0] != '_' &&
						coreDoc[label.replace('.substring', '')] ? (
							<div
								key={i}
							>
								<b>{itemFieldNames[label]}:</b> {formatField(coreDoc, label)} 
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
								<b>Cruise {itemFieldNames[label]}:</b> {formatField(cruiseDocs[0], label)} 
							</div>
						) : undefined
					) || undefined}
					{cruiseDocs && cruiseDocs.length && cruiseDocs[0]._cruiseID && 
					<List divided>
						<List.Item>
							<List.Content style={{ padding: '.25rem 0 .5rem' }}>
								<CollectionFileButton name='Cruise Report' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/cruisereport/OSU-${cruiseDocs[0]._cruiseID}-cruisereport.pdf`} />
								<CollectionFileButton name='Publications' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/publications/OSU-${cruiseDocs[0]._cruiseID}-publications.pdf`} />
								<CollectionFileButton name='Coring Data Sheet' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/coringdatasheet/OSU-${cruiseDocs[0]._cruiseID}-${coreDoc._coreNumber}-coringdatasheet.pdf`} />
								<CollectionFileButton name='MST Data' icon='file alternate outline' file={`${cruiseDocs[0]._cruiseID}/mstdata/${coreDoc._osuid}-mstdata.csv`} />
								<CollectionFileButton name='MST Data' icon='file alternate outline' file={`${cruiseDocs[0]._cruiseID}/mstdata/${coreDoc._osuid}-mstdata.out`} />
							</List.Content>
						</List.Item>
					</List> || undefined
				}
				</Grid.Column>
				<Grid.Column>
					{coreDoc.latitudeStart && coreDoc.longitudeStart && <>
						<Link href={`/map?find=${osuID}`}>
							<Image bordered size='tiny' floated='right'
								style={{ border: '2px solid white', zIndex: 1, margin: '-2px -2px 0 -100%' }}
								src={
									`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${coreDoc.latitudeStart},${coreDoc.longitudeStart}&` +
									`zoom=0&size=160x160&markers=color:0xD73F09|${coreDoc.latitudeStart},${coreDoc.longitudeStart}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
								}
							/>
							<Image size='medium' floated='right'
								src={
									`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${coreDoc.latitudeStart},${coreDoc.longitudeStart}&` +
									`zoom=7&size=640x640&markers=color:0xD73F09|${coreDoc.latitudeStart},${coreDoc.longitudeStart}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
								}
							/>
						</Link>
					</> || undefined }
				</Grid.Column>
			</Grid>
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
										{_.keys(itemFieldNames).map((label, i) => <FieldLabel
												key={i}
												label={label}
												doc={doc} />)}
									</List.Description>
									<List.Description style={{ margin: '0.5rem 0 -0.5rem'}}>
										<CollectionMapThumbnail lat={doc.latitudeStart} lon={doc.longitudeStart} />
										<CollectionImageThumbnail name='Section Image' file={`${cruiseDocs[0]._cruiseID}/image/${doc._osuid}-image.tif`} />
										<CollectionImageThumbnail name='Section Image' file={`${cruiseDocs[0]._cruiseID}/image/${doc._osuid}-image.tiff`} />
										<CollectionImageThumbnail name='Section Image' file={`${cruiseDocs[0]._cruiseID}/image/${doc._osuid}-image.jpeg`} />
										<CollectionImageThumbnail name='Section Image' file={`${cruiseDocs[0]._cruiseID}/image/${doc._osuid}-image.bmp`} />
										<CollectionImageThumbnail name='Section X-Ray' file={`${cruiseDocs[0]._cruiseID}/xray/${doc._osuid}-itraxxray.tif`} />
										<CollectionFileButton name='Core Description' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/coredescription/${doc._osuid}-coredescription.pdf`} />
									</List.Description>
								</List.Content>
							</List.Item>
						)}
					</List>
				</> || undefined
			}
			{ otherCoreDocs && otherCoreDocs.length && otherCoreDocs[0]._cruiseID &&
				<>
					<h3>Other Cores from Cruise/Program {coreDoc._cruiseID}</h3>
					<hr />
					<List divided>
						{ otherCoreDocs.map(doc => doc._osuid !== osuID && !osuIDs[doc._osuid] && (osuIDs[doc._osuid] = 1) &&
							<List.Item key={doc._uuid}>
								<Link href={`${doc._osuid}`}>
									<List.Content style={{ padding: '.25rem 0 .5rem' }}>
										<List.Header as='h3'>{doc._osuid}</List.Header>
										<List.Description>
											{_.keys(itemFieldNames).map((label, i) => <FieldLabel
												key={i}
												label={label}
												doc={doc} />)}
										</List.Description>
									</List.Content>
								</Link>
							</List.Item>
						)}
					</List>
				</> || undefined
			}
	</>;
}

const DiveLandingPage: FunctionComponent<{ diveDoc }> = ({ diveDoc }) => {
	const osuID = diveDoc._osuid;
	const cruiseDocs =  useTerms(['cruise'], diveDoc._cruiseUUID && { '_cruiseUUID.keyword': [diveDoc._cruiseUUID] } || undefined);
	const diveSampleDocs = useTerms(['diveSample'], diveDoc._diveUUID && { '_diveUUID.keyword': [diveDoc._diveUUID] } || undefined);
	const otherDiveDocs = useTerms(['dive'], diveDoc._cruiseUUID && { '_cruiseUUID.keyword': [diveDoc._cruiseUUID] } || undefined);
	
	const mapMarkers = [];
	[].concat(diveSampleDocs).forEach(doc => {
		if (doc && doc.latitudeStart !== undefined &&
				doc.longitudeStart !== undefined) {
			mapMarkers.push({
				lat: doc.latitudeStart,
				lon: doc.longitudeStart
			});
		}
	})

	const osuIDs = {};
	return <>
		<Menu secondary pointing stackable>
			<Menu.Item>
				<a href='/search'>
					Return to Search
				</a>
			</Menu.Item>
			{cruiseDocs && cruiseDocs[0] &&
				<Menu.Item>
					<a href={`/${cruiseDocs[0]._osuid}`}>
						Cruise/Program {cruiseDocs[0]._osuid.replace('OSU-', '')}
					</a>
				</Menu.Item> || undefined
			}
			<Menu.Item active>
				<p>
					Dive {osuID.replace('OSU-', '')}
				</p>
			</Menu.Item>
		</Menu>

		<h1>{osuID.replace('OSU-', '')}</h1>
			<Grid columns={2}>
				<Grid.Column>
					{_.keys(itemFieldNames).map((label, i) =>
						label[0] != '_' &&
						diveDoc[label.replace('.substring', '')] ? (
							<div
								key={i}
							>
								<b>{itemFieldNames[label]}:</b> {formatField(diveDoc, label)} 
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
								<b>Cruise {itemFieldNames[label]}:</b> {formatField(cruiseDocs[0], label)} 
							</div>
						) : undefined
					) || undefined}
					{cruiseDocs && cruiseDocs.length && cruiseDocs[0]._cruiseID && 
						<List divided>
							<List.Item>
								<List.Content style={{ padding: '.25rem 0 .5rem' }}>
									<CollectionFileButton name='Cruise Report' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/cruisereport/OSU-${cruiseDocs[0]._cruiseID}-cruisereport.pdf`} />
									<CollectionFileButton name='Publications' icon='file pdf outline' file={`${cruiseDocs[0]._cruiseID}/publications/OSU-${cruiseDocs[0]._cruiseID}-publications.pdf`} />
								</List.Content>
							</List.Item>
						</List> || undefined
					}
				</Grid.Column>
				<Grid.Column>
					{mapMarkers.length && <>
						<Link href={`/map?find=${osuID}`}>
							<Image bordered size='tiny' floated='right'
								style={{ border: '2px solid white', zIndex: 1, margin: '-2px -2px 0 -100%' }}
								src={
									`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${mapMarkers[0].lat},${mapMarkers[0].lon}&` +
									`zoom=0&size=160x160&markers=color:0xD73F09|${mapMarkers.map(x => x.lat + ',' + x.lon).join('|')}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
								}
							/>
							<Image size='medium' floated='right'
								src={
									`https://maps.google.com/maps/api/staticmap?maptype=hybrid&center=${mapMarkers[0].lat},${mapMarkers[0].lon}&` +
									`zoom=7&size=640x640&markers=color:0xD73F09|${mapMarkers.map(x => x.lat + ',' + x.lon).join('|')}&key=AIzaSyCINNnWmAK07o0DG3DYEAKx6Bf1SHrSMHw`
								}
							/>
						</Link>
					</> || undefined }
				</Grid.Column>
			</Grid>
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
										{_.keys(itemFieldNames).map((label, i)  => <FieldLabel
												key={i}
												label={label}
												doc={doc} />)}
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
				</> || undefined
			}
			{ otherDiveDocs && otherDiveDocs.length && otherDiveDocs[0]._cruiseID &&
				<>
					<h3>Other Dives from Cruise/Program {diveDoc._cruiseID}</h3>
					<hr />
					<List divided>
						{ otherDiveDocs.map(doc => doc._osuid !== osuID && !osuIDs[doc._osuid] && (osuIDs[doc._osuid] = 1) &&
							<List.Item key={doc._uuid}>
								<Link href={`${doc._osuid}`}>
									<List.Content style={{ padding: '.25rem 0 .5rem' }}>
										<List.Header as='h3'>{doc._osuid}</List.Header>
										<List.Description>
											{_.keys(itemFieldNames).map((label, i) => <FieldLabel
												key={i}
												label={label}
												doc={doc} />)}
										</List.Description>
									</List.Content>
								</Link>
							</List.Item>
						)}
					</List>
				</> || undefined
			}
	</>;
}

export const SearchLandingPage: FunctionComponent = () => {
	const { asPath } = useRouter();
	const osuID = asPath.substring(1);
	
	const searchDocs = useTerms(['cruise', 'core', 'dive'], { '_osuid.keyword': [osuID] });
	
	if (!searchDocs) 
		return <Loader active />;
	
	if (searchDocs.length === 0)
		return (
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
							<Link href='/search'>
								<Button icon fluid>
									<Icon name='search' />
									Search
								</Button>
							</Link>
						</>}
						style={{ margin: 'auto', width: 'auto' }}
					/>
			</Container>
		);
	const searchDoc = searchDocs[0];

	if (searchDoc._docType === 'cruise')
		return <CruiseLandingPage cruiseDoc={searchDoc} />;

	if (searchDoc._docType === 'core')
		return <CoreLandingPage coreDoc={searchDoc} />;

	if (searchDoc._docType === 'dive')
		return <DiveLandingPage diveDoc={searchDoc} />;
	
};

export default SearchLandingPage;