import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticPaths, GetStaticProps } from 'next';
import { usePlugin, useFormScreenPlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import * as Semantic from 'semantic-ui-react';
import { useGitHubSiteForm } from '../common/site';
import MDX from '@mdx-js/runtime';
import MD from 'markdown-to-jsx';
import Head from '../components/head';
import Layout from '../components/layout';
import { useRouter } from 'next/router';

const MDXWrapper: FunctionComponent = ({ children }) => {
	return (
		<MDX
			components={{
				md: (props) => <MD {...props} />,
				p: (props) => <p style={{ textAlign: 'justify' }} {...props} />,
				Ref: (props) => <Semantic.Ref {...props} />,
				Confirm: (props) => <Semantic.Confirm {...props} />,
				Pagination: (props) => <Semantic.Pagination {...props} />,
				PaginationItem: (props) => <Semantic.PaginationItem {...props} />,
				Portal: (props) => <Semantic.Portal {...props} />,
				PortalInner: (props) => <Semantic.PortalInner {...props} />,
				Radio: (props) => <Semantic.Radio {...props} />,
				Select: (props) => <Semantic.Select {...props} />,
				TextArea: (props) => <Semantic.TextArea {...props} />,
				TransitionablePortal: (props) => (
					<Semantic.TransitionablePortal {...props} />
				),
				Visibility: (props) => <Semantic.Visibility {...props} />,
				Breadcrumb: (props) => <Semantic.Breadcrumb {...props} />,
				BreadcrumbDivider: (props) => <Semantic.BreadcrumbDivider {...props} />,
				BreadcrumbSection: (props) => <Semantic.BreadcrumbSection {...props} />,
				Form: (props) => <Semantic.Form {...props} />,
				FormButton: (props) => <Semantic.FormButton {...props} />,
				FormCheckbox: (props) => <Semantic.FormCheckbox {...props} />,
				FormDropdown: (props) => <Semantic.FormDropdown {...props} />,
				FormField: (props) => <Semantic.FormField {...props} />,
				FormGroup: (props) => <Semantic.FormGroup {...props} />,
				FormInput: (props) => <Semantic.FormInput {...props} />,
				FormRadio: (props) => <Semantic.FormRadio {...props} />,
				FormSelect: (props) => <Semantic.FormSelect {...props} />,
				FormTextArea: (props) => <Semantic.FormTextArea {...props} />,
				Grid: (props) => <Semantic.Grid {...props} />,
				GridColumn: (props) => <Semantic.GridColumn {...props} />,
				GridRow: (props) => <Semantic.GridRow {...props} />,
				Menu: (props) => <Semantic.Menu {...props} />,
				MenuHeader: (props) => <Semantic.MenuHeader {...props} />,
				MenuItem: (props) => <Semantic.MenuItem {...props} />,
				MenuMenu: (props) => <Semantic.MenuMenu {...props} />,
				Message: (props) => <Semantic.Message {...props} />,
				MessageContent: (props) => <Semantic.MessageContent {...props} />,
				MessageHeader: (props) => <Semantic.MessageHeader {...props} />,
				MessageItem: (props) => <Semantic.MessageItem {...props} />,
				MessageList: (props) => <Semantic.MessageList {...props} />,
				Table: (props) => <Semantic.Table {...props} />,
				TableBody: (props) => <Semantic.TableBody {...props} />,
				TableCell: (props) => <Semantic.TableCell {...props} />,
				TableFooter: (props) => <Semantic.TableFooter {...props} />,
				TableHeader: (props) => <Semantic.TableHeader {...props} />,
				TableHeaderCell: (props) => <Semantic.TableHeaderCell {...props} />,
				TableRow: (props) => <Semantic.TableRow {...props} />,
				Button: (props) => <Semantic.Button {...props} />,
				ButtonContent: (props) => <Semantic.ButtonContent {...props} />,
				ButtonGroup: (props) => <Semantic.ButtonGroup {...props} />,
				ButtonOr: (props) => <Semantic.ButtonOr {...props} />,
				Container: (props) => <Semantic.Container {...props} />,
				Divider: (props) => <Semantic.Divider {...props} />,
				Flag: (props) => <Semantic.Flag {...props} />,
				Header: (props) => <Semantic.Header {...props} />,
				HeaderContent: (props) => <Semantic.HeaderContent {...props} />,
				HeaderSubheader: (props) => <Semantic.HeaderSubheader {...props} />,
				Icon: (props) => <Semantic.Icon {...props} />,
				IconGroup: (props) => <Semantic.IconGroup {...props} />,
				Image: (props) => <Semantic.Image {...props} />,
				ImageGroup: (props) => <Semantic.ImageGroup {...props} />,
				Input: (props) => <Semantic.Input {...props} />,
				Label: (props) => <Semantic.Label {...props} />,
				LabelDetail: (props) => <Semantic.LabelDetail {...props} />,
				LabelGroup: (props) => <Semantic.LabelGroup {...props} />,
				List: (props) => <Semantic.List {...props} />,
				ListContent: (props) => <Semantic.ListContent {...props} />,
				ListDescription: (props) => <Semantic.ListDescription {...props} />,
				ListHeader: (props) => <Semantic.ListHeader {...props} />,
				ListIcon: (props) => <Semantic.ListIcon {...props} />,
				ListItem: (props) => <Semantic.ListItem {...props} />,
				ListList: (props) => <Semantic.ListList {...props} />,
				Loader: (props) => <Semantic.Loader {...props} />,
				Placeholder: (props) => <Semantic.Placeholder {...props} />,
				PlaceholderHeader: (props) => <Semantic.PlaceholderHeader {...props} />,
				PlaceholderImage: (props) => <Semantic.PlaceholderImage {...props} />,
				PlaceholderLine: (props) => <Semantic.PlaceholderLine {...props} />,
				PlaceholderParagraph: (props) => (
					<Semantic.PlaceholderParagraph {...props} />
				),
				Rail: (props) => <Semantic.Rail {...props} />,
				Reveal: (props) => <Semantic.Reveal {...props} />,
				RevealContent: (props) => <Semantic.RevealContent {...props} />,
				Segment: (props) => <Semantic.Segment {...props} />,
				SegmentGroup: (props) => <Semantic.SegmentGroup {...props} />,
				SegmentInline: (props) => <Semantic.SegmentInline {...props} />,
				Step: (props) => <Semantic.Step {...props} />,
				StepContent: (props) => <Semantic.StepContent {...props} />,
				StepDescription: (props) => <Semantic.StepDescription {...props} />,
				StepGroup: (props) => <Semantic.StepGroup {...props} />,
				StepTitle: (props) => <Semantic.StepTitle {...props} />,
				Accordion: (props) => <Semantic.Accordion {...props} />,
				AccordionAccordion: (props) => (
					<Semantic.AccordionAccordion {...props} />
				),
				AccordionContent: (props) => <Semantic.AccordionContent {...props} />,
				AccordionPanel: (props) => <Semantic.AccordionPanel {...props} />,
				AccordionTitle: (props) => <Semantic.AccordionTitle {...props} />,
				Checkbox: (props) => <Semantic.Checkbox {...props} />,
				Dimmer: (props) => <Semantic.Dimmer {...props} />,
				DimmerDimmable: (props) => <Semantic.DimmerDimmable {...props} />,
				DimmerInner: (props) => <Semantic.DimmerInner {...props} />,
				Dropdown: (props) => <Semantic.Dropdown {...props} />,
				DropdownDivider: (props) => <Semantic.DropdownDivider {...props} />,
				DropdownHeader: (props) => <Semantic.DropdownHeader {...props} />,
				DropdownItem: (props) => <Semantic.DropdownItem {...props} />,
				DropdownMenu: (props) => <Semantic.DropdownMenu {...props} />,
				DropdownSearchInput: (props) => (
					<Semantic.DropdownSearchInput {...props} />
				),
				Embed: (props) => <Semantic.Embed {...props} />,
				Modal: (props) => <Semantic.Modal {...props} />,
				ModalActions: (props) => <Semantic.ModalActions {...props} />,
				ModalContent: (props) => <Semantic.ModalContent {...props} />,
				ModalDescription: (props) => <Semantic.ModalDescription {...props} />,
				ModalDimmer: (props) => <Semantic.ModalDimmer {...props} />,
				ModalHeader: (props) => <Semantic.ModalHeader {...props} />,
				Popup: (props) => <Semantic.Popup {...props} />,
				PopupContent: (props) => <Semantic.PopupContent {...props} />,
				PopupHeader: (props) => <Semantic.PopupHeader {...props} />,
				Progress: (props) => <Semantic.Progress {...props} />,
				Rating: (props) => <Semantic.Rating {...props} />,
				RatingIcon: (props) => <Semantic.RatingIcon {...props} />,
				Search: (props) => <Semantic.Search {...props} />,
				SearchCategory: (props) => <Semantic.SearchCategory {...props} />,
				SearchResult: (props) => <Semantic.SearchResult {...props} />,
				SearchResults: (props) => <Semantic.SearchResults {...props} />,
				Sidebar: (props) => <Semantic.Sidebar {...props} />,
				SidebarPushable: (props) => <Semantic.SidebarPushable {...props} />,
				SidebarPusher: (props) => <Semantic.SidebarPusher {...props} />,
				Sticky: (props) => <Semantic.Sticky {...props} />,
				Tab: (props) => <Semantic.Tab {...props} />,
				TabPane: (props) => <Semantic.TabPane {...props} />,
				Transition: (props) => <Semantic.Transition {...props} />,
				TransitionGroup: (props) => <Semantic.TransitionGroup {...props} />,
				Advertisement: (props) => <Semantic.Advertisement {...props} />,
				Card: (props) => <Semantic.Card {...props} />,
				CardContent: (props) => <Semantic.CardContent {...props} />,
				CardDescription: (props) => <Semantic.CardDescription {...props} />,
				CardGroup: (props) => <Semantic.CardGroup {...props} />,
				CardHeader: (props) => <Semantic.CardHeader {...props} />,
				CardMeta: (props) => <Semantic.CardMeta {...props} />,
				Comment: (props) => <Semantic.Comment {...props} />,
				CommentAction: (props) => <Semantic.CommentAction {...props} />,
				CommentActions: (props) => <Semantic.CommentActions {...props} />,
				CommentAuthor: (props) => <Semantic.CommentAuthor {...props} />,
				CommentAvatar: (props) => <Semantic.CommentAvatar {...props} />,
				CommentContent: (props) => <Semantic.CommentContent {...props} />,
				CommentGroup: (props) => <Semantic.CommentGroup {...props} />,
				CommentMetadata: (props) => <Semantic.CommentMetadata {...props} />,
				CommentText: (props) => <Semantic.CommentText {...props} />,
				Feed: (props) => <Semantic.Feed {...props} />,
				FeedContent: (props) => <Semantic.FeedContent {...props} />,
				FeedDate: (props) => <Semantic.FeedDate {...props} />,
				FeedEvent: (props) => <Semantic.FeedEvent {...props} />,
				FeedExtra: (props) => <Semantic.FeedExtra {...props} />,
				FeedLabel: (props) => <Semantic.FeedLabel {...props} />,
				FeedLike: (props) => <Semantic.FeedLike {...props} />,
				FeedMeta: (props) => <Semantic.FeedMeta {...props} />,
				FeedSummary: (props) => <Semantic.FeedSummary {...props} />,
				FeedUser: (props) => <Semantic.FeedUser {...props} />,
				Item: (props) => <Semantic.Item {...props} />,
				ItemContent: (props) => <Semantic.ItemContent {...props} />,
				ItemDescription: (props) => <Semantic.ItemDescription {...props} />,
				ItemExtra: (props) => <Semantic.ItemExtra {...props} />,
				ItemGroup: (props) => <Semantic.ItemGroup {...props} />,
				ItemHeader: (props) => <Semantic.ItemHeader {...props} />,
				ItemImage: (props) => <Semantic.ItemImage {...props} />,
				ItemMeta: (props) => <Semantic.ItemMeta {...props} />,
				Statistic: (props) => <Semantic.Statistic {...props} />,
				StatisticGroup: (props) => <Semantic.StatisticGroup {...props} />,
				StatisticLabel: (props) => <Semantic.StatisticLabel {...props} />,
				StatisticValue: (props) => <Semantic.StatisticValue {...props} />,
			}}
		>
			{children}
		</MDX>
	);
};

const Staff: FunctionComponent = () => {
	return (
		<MDXWrapper>{`
<Grid>
	<GridRow>
		<GridColumn width='3'>
			<Image centered bordered rounded size='medium' src='/jstoner.jpg' />
		</GridColumn>
		<GridColumn width='13'>
			<Header>Dr. Joseph Stoner</Header>
			<Container textAlign='justified'>
				As co-director of the OSU-MGR Joe oversees all repository activities and final approval of all sample requests.
			</Container>
		</GridColumn>
	</GridRow>
	<Divider/>
	<GridRow>
		<GridColumn width='3'>
			<Image centered bordered rounded size='medium' src='/akoppers.jpg' />
		</GridColumn>
		<GridColumn width='13'>
			<Header>Dr. Anthony Koppers</Header>
			<Container textAlign='justified'>
				As co-director Anthony oversees the hard rock collection and digital conversion of the repository records.
			</Container>
		</GridColumn>
	</GridRow>
	<Divider/>
	<GridRow>
		<GridColumn width='3'>
			<Image centered bordered rounded size='medium' src='/mcheseby.jpg' />
		</GridColumn>
		<GridColumn width='13'>
			<Header>Maziet Cheseby</Header>
			<Container textAlign='justified'>
				As Chief Curator, Maziet (pronounced may-zee) is in charge of all day to day operations of the repository, including operating and maintaining the GEOTEK multi-sensor track systems, core and sample tracking systems, databases, reviewing sample requests and administrative duties. Maziet has also developed the use of CT scans, in partnership with the OSU Veterinary Hospital, and the GEOTEK multi-sensor track systems on cores as a repository fee service.
			</Container>
		</GridColumn>
	</GridRow>
	<Divider/>
	<GridRow>
		<GridColumn width='3'>
			<Image centered bordered rounded size='medium' src='/vstanley.jpg' />
		</GridColumn>
		<GridColumn width='13'>
			<Header>Val Stanley</Header>
			<Container textAlign='justified'>
				Val is the curator of the Antarctic Core Collection. At present her top priority is coordination and logistics for transferring the collection from the Antarctic Research Facility in Tallahassee to Corvallis, as well as migrating digital data assets to the OSU data structure. Val started at OSU-MGR in late October 2017, after working with several other geological research collections. Her interests and background include:
				improving discoverability, accessibility, and interoperability for physical samples,
				data preservation and rescue techniques,
				applications of cyberinfrastructure for geoscience, and
				geospatial data visualization technologies.
			</Container>
		</GridColumn>
	</GridRow>
	<Divider/>
	<GridRow>
		<GridColumn width='3'>
			<Image centered bordered rounded size='medium' src='/kkonrad.jpg' />
		</GridColumn>
		<GridColumn width='13'>
			<Header>Kevin Konrad</Header>
			<Container textAlign='justified'>
				Kevin is an assistant curator at the OSU-MGR who oversees the marine dredge and dive samples as well as terrestrial geologic samples. He cuts, photographs and describes the NOAA dive collection. In addition, he is working towards organizing and digitizing pre-existing dredge and dive collections at OSU. Kevin maintains the website, including the NOAA and rock collections. Kevin also handles rock sample requests.
			</Container>
		</GridColumn>
	</GridRow>
	<Divider/>
	<GridRow>
		<GridColumn width='3'>
			<Image centered bordered rounded size='medium' src='/cfritz.jpg' />
		</GridColumn>
		<GridColumn width='13'>
			<Header>Cara Fritz</Header>
			<Container textAlign='justified'>
				Cara is an assistant curator at the OSU-MGR. Cara is digitizing the entire collection from analog paper files to discoverable data online. Cara fills sample requests and enters and manages data for sediment sample requests and distribution. Cara leads the repository’s education and outreach programs.
			</Container>
		</GridColumn>
	</GridRow>
	<Divider/>
	<GridRow>
		<GridColumn width='3'>
			<Image centered bordered rounded size='medium' src='/bconard.jpg' />
		</GridColumn>
		<GridColumn width='13'>
			<Header>Bobbi Conard</Header>
			<Container textAlign='justified'>
				Bobbi Conard is an emeritus curator, having work in the repository since 1984. She is working toward completing the data digitization project, concentrating on the older cores and dredges. Somewhat to her chagrin, she has also been called the “institutional memory”.
			</Container>
		</GridColumn>
	</GridRow>
</Grid>
		`}</MDXWrapper>
	);
};

const FacilityHistory: FunctionComponent = () => {
	return (
		<MDXWrapper>{`
<Image bordered rounded size='large' floated='right' src='original-core-fridge.png' style={{ clear: 'right' }}/>

# Facility History

Since 1960, the College of Earth, Ocean and Atmospheric Sciences (CEOAS) at Oregon State University (OSU) has maintained an active program in Marine Geology, and CEOAS continues to be one of the leading oceanographic institutions involved in exploration, research and the collection of marine samples. To preserve these materials for future research, Drs. Ted C. Moore and LaVerne Kulm in 1971 established the OSU Core Lab, now known as the OSU Marine and Geology Repository.

The facility began receiving support by the U.S. National Science Foundation (NSF) in 1972 when the laboratory relocated to a building with 4,800 cubic feet (CFT) of refrigerated space for core storage. The OSU Marine and Geology Repository has been funded continuously since 1976 as a national NSF community facility with a mission to archive and distribute geological samples for scientific research and education.

<Image bordered rounded size='large' floated='right' src='first-core-lab.jpg' style={{ clear: 'right' }}/>

In 1986, Drs. Alan C. Mix and Martin Fisk assumed management of the facility and since that time the OSU Marine and Geology Repository has undergone several phases of expansion and remodeling. Following the 1990 expansion of refrigerated space, the sediment core collection of the University of Washington was incorporated, and the name changed from the OSU Core Laboratory to the OSU/NORCOR Marine Geology Repository. In 1994, a second major expansion of the facility was completed. The refrigerated space was increased to 30,000 CFT. At that time a laboratory for core description and sample handling was added. In 1995, the first repository web page was launched. In 2002, the rock storage facility was renovated, adding another 5,500 CFT of shelved, interior rock storage and additional covered exterior staging space. In 2003, the facility was renamed the OSU/COAS Marine Geology Repository.

<Image bordered rounded size='large' floated='right' src='nypro-core-lab.jpg' style={{ clear: 'right' }}/>

Dr. David Christie replaced Dr. Fisk in 2003 as curator of the rock collection and sampling activities and in 2006 Dr. Christie was replaced by Dr. Robert Duncan. At the end of 2005, Dr. Nicklas Pisias replaced Dr. Mix as the curator responsible for oversight of the sediment core and trap sample collections. This transition established a closer link between the OSU Marine Geology Repository and the OSU Marine Coring Facility (Dr. Pisias, PI) that supports US scientists needing coring expertise aboard UNOLS vessels including the R/V Oceanus, R/V Melville, R/V Revelle, R/V Kilo Moana, R/V Langseth and the USCG icebreaker Healy. The collaboration in particular facilitated the collection of shipboard physical properties data using the containerized multi-sensor track owned by the OSU Marine Geology Repository.

Dr. Stoner and Dr. Koppers replaced Drs. Pisias and Duncan in 2010. In 2009 refrigerated space was increased to a total of 41,000 CFT and in 2010 a -11°F, 1,100 CFT freezer was installed for frozen storage of gas hydrate bearing samples donated by the Department of Energy-National Energy and Technology Laboratory (DOE-NETL). In October 2011 COAS merged with the OSU Department of Geosciences to become the new, expanded College of Earth, Ocean and Atmospheric Sciences (CEOAS). At that time, the repository was renamed the OSU Marine and Geology Repository.

<Image bordered rounded size='large' floated='right' src='arf-move.jpg' style={{ clear: 'right' }}/>

# Merging Two Historic Collections

The story of the Antarctic Core Collection’s (ACC) transition from Florida State University (FSU) to Oregon State University (OSU) is one of the largest-scale data rescue efforts in recent history. The ACC is the world’s largest collection of seafloor sediment samples from the Southern Ocean. The collection was officially established in 1963 as the US Antarctic Program took shape. For the next fifty years, the collection grew to represent the scientific discoveries of over one-hundred and twenty research cruises and expeditions around Antarctica. FSU hosted the irreplaceable collection at its Antarctic Research Facility, an iconic lab in the center of campus. In 2016, the university chose not to renew its contract for supporting the facility. Recognizing the value and potential of the collection, the National Science Foundation began a search for another university to host these important samples and enable future research.

In 2016, OSU Marine and Geology Repository initiated a plan to relocate this historic collection of over eighteen kilometers of core samples from Tallahassee, FL to Corvallis, OR. The project began by planning and constructing a state-of-the-art facility with temperature-controlled space to house the next fifty years of coring expeditions. In the summer of 2018, the ACC was carefully packaged, digitally inventoried, and shipped to OSU in thirteen 53-foot refrigerated semi-trucks over the course of nearly five weeks.

<Image bordered rounded size='large' floated='right' src='nypro-cold-room.jpg' style={{ clear: 'right' }}/>

At present, the OSU Marine and Geology Repository archives the Marine Geology and Geophysics Collection which consists of over 16,700 meters of marine sediment from over 6,300 core sites, 430 meters of lake sediment from 172 core sites and 1,600 sediment trap samples. The Dredge and Dive Rock Collection contains more than 10,000 rocks from over 500 dredges and includes 528 manganese nodules.  The Antarctic Core Collection contains over 18,500 meters of deep-sea core sediment from 7,370 core sites. Also curated at the OSU-MGR are rock samples from 139 ROV dives sampled by NOAA in marine national monuments of the Pacific Ocean.

The grand opening of the new facility was held on January 31, 2020. It was the most attended outreach event ever for the College of Earth, Ocean, and Atmospheric Sciences at Oregon State University (276 attendees). The event’s program included a welcome from the co-Directors, then technical talks by three experts who could give historical context to the collections – Nick Pisias, Martin Fisk, and Alan Mix. Attendees then had the opportunity to tour the facility and meet the curators, as well as students who have worked with the collections for their research. The evening finished off with remarks by Provost Ed Feser and a toast by Anthony Koppers.
	
		`}</MDXWrapper>
	);
};

const Services: FunctionComponent = () => {
	return (
		<MDXWrapper>{`
The OSU MGR offers numerous services from curation, sample measurement, coring and complementary analyses.

The OSU MGR is bound by NSF OCE <a href="http://www.nsf.gov/pubs/2011/nsf11060/nsf11060.pdf">data policy</a> for all NSF/OCE/MGG funded projects (please refer to parts III and VII).

<Accordion defaultActiveIndex={0} panels={[
	{
		key: 0,
		title: { content: <h2 style={{ display: 'inline' }}>Facility Instrumentation</h2> },
		content: { content: <div style={{ marginLeft: '2em' }}>
			<p>
				The main corelab is equipped with multiple work benches, computer facilities, and sampling tools. The wetlab contains a fume hood and DI water.
			</p>
			<p>
				The following equipment is available to users of the OSU-MGR. For a list of fees see the Fees section below.
			</p>
			<md children={\`
- A GEOTEK MSCL-S multi-sensor track (MST) that provides gamma ray attenuation (GRA) bulk density, loop magnetic susceptibility (MS), P-wave velocity (PWA) and electrical resistivity (ER)  
- A GEOTEK XZ system that provides line scan camera photography and point-source magnetic susceptibility (MS)  
- A GEOTEK XYZ system that provides point-source magnetic susceptibility (MS), handheld XRF, and color spectrophotometry  
- An ITRAX XRF Scanner capable of split core and u-channel measurement at fine-scale resolution  
- GEOTEK Core Splitter  
- Rock saws  
- Rock drill press  
- Freeze dryers  
- Electronic balances  
- Two -30°C upright freezers  
- Beckman Coulter LS 13 320 laser diffraction particle size analyzer  
- Microscopes (petrographic with digital camera and binocular)  
- Photography station (Norman flash photography strobe lighting system)  
- Automated label makers
			\`}/>
		</div> }
	},
	{
		key: 1,
		title: { content: <h2 style={{ display: 'inline' }}>Fees</h2> },
		content: { content: <div style={{ marginLeft: '2em' }}>
			<p>
				The OSU MGR is funded by NSF to provide curation for marine geological samples. Curation and sample dissemination is therefore a central part of the OSU MGR’s activities. The core lab is equipped with, and has access to a range of equipment that can be used to measure cores. Some of this is included under standard curation practice, others require fees.
			</p>
			<Table unstackable>
				<TableHeader>
					<TableRow>
						<TableHeaderCell>Item:</TableHeaderCell>
						<TableHeaderCell>Fee:</TableHeaderCell>
					</TableRow>
				</TableHeader>
				<TableBody>
				<TableRow>
					<TableCell>Curation of Samples</TableCell>
					<TableCell>No charge for NSF funded projects</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Sampling</TableCell>
					<TableCell>No charge for NSF funded projects. Though we will request PI’s undertake their own sampling for large requests.</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Sending Samples</TableCell>
					<TableCell>No charge for ground shipping for NSF funded projects. Expedited, Air, or special shipping will incur costs.</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Archival Materials (D-tubes, specialized boxes etc)</TableCell>
						<TableCell>At cost/provided by investigator. Please email osu-mgr@oregonstate.edu for details and pricing</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Particle Size Analyzer</TableCell>
						<TableCell>$55 per day use with technician oversight. Training and set-up costs may apply – see Technician Time</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Freeze Dryer</TableCell>
						<TableCell>$12 per day use with technician oversight. Training and set-up costs may apply – see Technician Time</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Splitter Saw</TableCell>
						<TableCell>$17 per day use with technician oversight. Training and set-up costs may apply – see Technician Time</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Split core track (Camera, Magnetic Susceptibility)</TableCell>
						<TableCell>$86 per day use with technician oversight. Training and set-up costs may apply – see Technician Time</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Whole core track (MS, GRA, PWave, Resistivity)</TableCell>
						<TableCell>$91 per day use with technician oversight. Training and set-up costs may apply – see Technician Time</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>XYZ Multi-core track</TableCell>
						<TableCell>$86 per day use with technician oversight. Training and set-up costs may apply – see Technician Time.</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>ITRAX XRF core scanner (capable of split core and uchannel samples)</TableCell>
						<TableCell>$33 per hour of use with technician oversight. Training and set-up costs may apply – see Technician Time.</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Technician Time</TableCell>
						<TableCell>$70-$161 per hour. Rate for training, set-up, data processing, instrument and technical assistance database entry etc. <b>These technician rates apply for our CT scan analyses.</b> Higher rate may apply for customers requiring XRF scans</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div> }
	},
	{
		key: 2,
		title: { content: <h2 style={{ display: 'inline' }}>Coring and Dredging Services</h2> },
		content: { content: <div style={{ marginLeft: '2em' }}>
			<h3>Coring and Dredging Services</h3>
			<p>
				The OSU Marine Sediment Sampling (MARSSAM) facility provides coring and dredging services for NSF groups and investigators using the UNOLS fleet as well as the USCG ice breaker R/V Healy. Funding for these services to United States NSF-funded investigators is provided by the Ship Facilities Program, and MARSSAM is also available on a contract basis to non-NSF investigators. The OSU coring gear is among the best available in the United States, including large-volume and small-volume piston corers, a variety of box and kasten corers, as well as multi- and slow corers for undisturbed recovery of the sediment-water interface. Seagoing technicians from the facility have operated coring and dredging gear on most UNOLS vessels.
			</p>
			<p>
				Services are customized to fit your needs, and can include use of hardware, personnel, deck handling gear, refrigerated shipping vans, sample describing materials, and permanent archival in the OSU Marine and Geology Repository.
			</p>
			<p>
				For more information or to contract coring or dredging services, visit the dedicated <a href="http://marssam.ceoas.oregonstate.edu/">Marine Sediment Sampling (MARSSAM) group website</a>.
			</p>
		</div> }
	},
	{
		key: 3,
		title: { content: <h2 style={{ display: 'inline' }}>Other OSU Laboratory Facilities</h2> },
		content: { content: <div style={{ marginLeft: '2em' }}>
			<h3>Paleomagnetic Laboratory</h3>
			<p>
				The <a href="http://paleomag.coas.oregonstate.edu/">Paleo-and-Environmental Magnetism Laboratory</a> in the College of Oceanic and Atmospheric Sciences at Oregon State University is operated by MGR Director <a href="http://paleomag.coas.oregonstate.edu/people/PI/stoner.html">Dr. Joseph Stoner</a>. The <a href="http://paleomag.coas.oregonstate.edu/">P-Mag Lab</a> is an NSF supported OSU facility dedicated to sediment magnetism and a resource for Pacific NW, national and international scientific communities. Built around a helium free 2G Enterprises superconducting rock magnetometer (SRM) optimized for u-channel samples, it plays a strong role in supporting the the marine geology repository. For further information on paleo-and-environmental magnetic services please contact <a href="http://paleomag.coas.oregonstate.edu/people/PI/stoner.html">Dr. Joseph Stoner</a>.
			</p>		
			<h3>40Ar/39Ar Geochronology Laboratory</h3>
			<p>
				The <a href="http://geochronology.coas.oregonstate.edu/">40Ar/39Ar Geochronology Laboratory</a> in the College of Oceanic and Atmospheric Sciences at Oregon State University is operated by MGR Director <a href="http://ceoas.oregonstate.edu/profile/koppers/">Dr. Anthony Koppers</a>. The OSU <a href="http://geochronology.coas.oregonstate.edu/">Argon Geochronology Lab</a> carries out 40Ar/39Ar analyses services for outside researchers all over the world, operating two noble gas  mass spectrometers to carry out 40Ar/39Ar age determinations. For further information on 40Ar/39Ar analyses and services please contact <a href="http://ceoas.oregonstate.edu/profile/koppers/">Dr. Anthony Koppers</a>.
			</p>
		</div> }
	}
]}/>

		`}</MDXWrapper>
	);
};

const RequestSamples: FunctionComponent = () => {
	return (
		<MDXWrapper>{`
<h2>Sample Requests</h2>
<h3>How to request samples from the OSU MGR.</h3>
<p>
	At the OSU Marine and Geology Repository (OSU-MGR) we distribute thousands of sediment and hard rock samples on an annual basis to researchers all over the world. Instructions on how to request these samples from the OSU-MGR and our Sample and Data Policies are detailed below. Please go step-by-step through the following six steps:
</p>
<p>
	<b>Step 1:</b> Decide which samples you wish to study and request. You can find an inventory of OSU holdings on the <a href="http://www.ngdc.noaa.gov/geosamples/index.jsp?inst=OSU">Index to Marine and Lacustrine Geological Samples (IMLGS)</a> website and on our <a href="/collections">Main OSU collection</a> and <a href="noaa-ex">NOAA collections</a> pages.
</p>
<p>
	<b>Step 2:</b> Read and familiarize yourself with the sample distribution policies and guidelines on how to request samples. Note that these are slightly different for sediment and hard rock requests.
</p>
<Accordion panels={[
	{
		key: 0,
		title: { content: <h2 style={{ display: 'inline' }}>Sediment and Rock Core Sample Distribution Policy and Sample Request Guidelines</h2> },
		content: { content: <div style={{ marginLeft: '2em' }}>
			<h3>Introduction</h3>
			As an NSF-OCE-MGG funded facility, the OSU-MGR (and therefore PI’s who curate their samples) is bound by the <a href="https://www.nsf.gov/pubs/2017/nsf17037/nsf17037.pdf">NSF-OCE data policy</a> for NSF-OCE funded projects. Samples from cores and sediment traps, information on sampling stations, and descriptions of materials from the OSU collection are provided to qualified scientific investigators upon receipt of well-documented requests. Materials for educational purposes and museum displays may also be available in limited quantities.
			
			<h3>Submission Documents</h3>
			We require that requestors submit two documents with their sample request:
			
			<h5>Initial Statement of Proposed Research</h5>
			Investigators should submit a letter (paper or via electronic mail in PDF format) to request samples. Each request should include a short outline of the intended studies, methods, objectives and names and addresses of collaborating investigators. Initial requests should be considered a survey to determine if more samples will be required later. Large requests require justification. Subsequent sample requests during the same investigation should include an additional statement describing progress of the study and stating the need for additional material. Student requests should be submitted through their academic advisor.
			
			Sample Request Sheet
			Please download and use the Sediment and Rock Core Sample Request Sheet to detail the samples you are requesting. Please be as detailed as possible in filling out this form and consider the following:
			
			Sample Location and Position Please specify the ship, cruise number, geographic area, core or dredge number, and sample depth in core. Give alternative cores or dredges, and sampling intervals in cores whenever possible. Since surface sediment material is asked for most frequently, many cores no longer have available surface material. Subsurface samples are usually available.
			Size of Samples Indicate the minimum sample weight or volume needed. The usual sample size for sediment cores is about 5 cc (about 8-12 grams, depending upon sediment type, or an approximately 1.0 cm thick quarter section of split core). Larger sample volumes must be justified. Samples from core tops are often restricted to 1 cc (2 grams). Larger sample volumes may be available from box cores, kasten cores or large diameter gravity cores.
			
			Special Note for Archive Half Requests
			Cores are split into two identical halves after retrieval, the working half and the archive half. While the working half is available for sampling to facilitate the scientific objectives the archive half  is intended to remain a pristine ‘archive’ of the material recovered. All the non-destructive analyses are usually made on the archive half (e.g. magnetic susceptibility, gamma ray density, line scan images, XRF-scans, CT-scans etc) leaving it as a permanent record.
			
			However, sometimes the need arises to sample the archive half. This is usually because of complete depletion of the working half. In these instances careful decisions are made by the repository staff as to whether the proposed science and sampling plan justifies sampling of the archive half of the core. If approved sampling of the archive half destroys the pristine nature of the core, preventing further non-destructive measurement.
			
			In order to preserve the most complete record of the core the OSU-MGR has set up a policy for the sampling of pristine archive halves that aims to preserve as much information as possible before sampling:
			
			Before sampling all non-destructive analysis must be completed on the section. Some of this is routine curation practice and has no cost to the person(s) requesting samples, others are not and will incur costs to the person(s) making the request.
			
			Magnetic Susceptibility – routine curation (both measurements are accomplished on the MST track housed in our seagoing van; when this van is out at sea MST measurements cannot be made and therefore add a significant delay (weeks-months) to the accomplishment of non-destructive analyses and therefore sampling).
			Line Scan Image – routine curation.
			CT-Scan – charged to proponent (see our fees page)
			XRF-scan – charged to proponent (see our fees page)
			Approval, Sampling and Shipping
			Approval of Request Sample requests are forwarded to the curators for approval. In cases of conflict of interest, uninvolved faculty are consulted. Principal investigators who obtained materials are consulted if they are still studying requested materials. Conflicts between different investigators requesting the same samples for the same purpose are mediated and resolved by consultation.
			
			Sampling The staff of the OSU Repository will do the sampling or you may do it yourself under their supervision. Please contact the core curator to schedule sampling visits. There is space for sampling, but laboratory space for sample preparation is minimal.
			
			Sample shipment Samples are normally shipped within two or three weeks after approval.
		</div> }
	},
	{
		key: 1,
		title: { content: <h2 style={{ display: 'inline' }}>Dredge and Dive Sample Distribution Policy and Sample Request Guidelines</h2> },
		content: { content: <div style={{ marginLeft: '2em' }}>
			<h3>Introduction</h3>
			All sample requests need to be submitted through the OSU-MGR online portal. Please browse through the online archive, which provides high resolution petrographic images (whole rocks + thin sections) and detailed descriptions for most samples, and identify and select the samples that support your research project best. In order to request samples, investigators should upload both the standard OSU-MGR rock sample request form (in Excel spreadsheet format) and a written statement of the proposed research in a separate letter (in PDF format).
			<h3>Submission Documents</h3>
			We require that requestors submit two documents with their sample request:
			<h5>Statement of Proposed Research</h5>
			This letter should include a short outline of the intended studies, detailed methods, research objectives, and names and addresses of collaborating investigators. Since many of the submarine rock samples in the OSU-MGR are small in size and/or have been collected at great costs from unique places around the world, it is requested that in the statement special attention is given to the rationale of what to sample, how much, how many samples, and the return of unused materials. Please review all images and descriptions of the rocks prior to requesting samples. Subsequent sample requests during the same investigation should include an additional statement describing progress of the study and stating the need for additional material. Student requests should be submitted through their academic advisor. Maximum two pages. Include your two-page CV or NSF-style biosketch for the PI and/or students and other scientists, if applicable.
			<h5>OSU-MGR Rock Sample Request</h5>
			Please download, fill out and submit the Dredge and Dive Sample Request Form to osu-mgr@oregonstate.edu. In the form, use the Sample Name (e.g. OSU-EX1504L2-D1-1) shown on the OSU-MGR collection website. Provide a brief summary of the analyses planned for the sample in the Purpose column. State clearly if specific sections of the sample are required (e.g. glassy rinds, fresh or altered rocks sections) in the Material column. Indicate the minimum sample weight (in grams) or volume (in cubic cm or cc) needed in the Sample Size column. Whenever possible, provide alternative dives or dredges, as some samples may not contain enough material to complete the proposed experiments. Please indicate whether it is a primary or alternate sample in the Request Type column. Please specify if any specific sample preparation is required (e.g. no saw marks) in the Comments column.
			<h3>Note about Thin Sections</h3>
			Most samples contain a prepared petrographic thin section that has been polished to 1 µm grit. These sections are available to borrow upon request. As high resolution plane-polarized and cross-polarized photos of these thin sections are already available in the OSU-MGR database, we ask that thin sections only be requested if SEM, EMP, FTIR or similar experiments are to be undertaken. Indicate if the thin sections will be coated and with what material in the sample request letter. We request that thin sections be returned to the repository within two years or upon completion of the proposed research project.
			<h3>Approval and Sampling</h3>
			<p>
				<b>Review Process.</b> The sample request form and research statement will be reviewed by the OSU-MGR curatorial staff and the co-directors. Initial requests for pilot studies should be considered in order to determine if more samples will be required later. Large sample requests (&gt;10 samples) may be subject to a more strenuous review, potentially requiring feedback from outside the OSU-MGR curatorial staff and directors.
			</p>
			<p>
				<b>Obligations.</b> Results from all work on requested samples are expected to be published in a peer-reviewed scientific journal. Please send a PDF of any published data from the samples. Failure to publish data on requested samples may result in the denial of future requests. If the publication obligation cannot be met within three years from the sample request, a written report explaining the reasons for non-publication is expected as is the return of all unused materials. All thin sections requested are to be return within two years.
			</p>
			<p>
				<b>Sampling at the OSU-MGR.</b> You or your student(s) are welcome to come to the facility to subsample the rocks yourself; otherwise we will process and send the requested samples. Please contact us at osu-mgr@oregonstate.edu to establish a date and time for the onsite OSU-MGR sampling visit.
			</p>
		</div> }
	},
]}/>
<p>
</p>
<p>
	<b>Step 3:</b> Download and complete the Sediment and Rock Core Sample Request Form or Dredge and Dive Sample Request Form
</p>
<p>
	<b>Step 4:</b> Send the completed form with appropriate documentation (see guidelines above) to the curator at osu-mgr@oregonstate.edu via email.
</p>
<p>
	<b>Step 5:</b> If you publish on the samples you request from the OSU-MGR then please acknowledge the OSU-MGR in your manuscript.
</p>
<p>
	<b>Step 6:</b> Please send us copies (PDF’s), or links to published content that use samples hosted in our collection.
</p>
<p>
	For more information on how to request samples or how to request samples other than sediments and rocks, please contact us via email at osu-mgr@oregonstate.edu.
</p>
		`}</MDXWrapper>
	);
};

const SedCT: FunctionComponent = () => {
	return (
		<MDXWrapper>{`
# SedCT v. 1.06
SedCT is a MATLAB based application for quick, user-friendly processing of sediment core CT data, collected on a medical CT scanner.  It was designed for use with products from the Oregon State University College of Veterinary Medicine Toshiba Aquilion 64 Slice medical CT scanner, but has been tested on other medical CT scanner systems  Please contact Brendan Reilly (btreilly@ucsd.edu) with feedback, questions, and issues.

We hope you find these tools useful.  If you do use them, please cite:

Reilly, B., Stoner, J., Weist J., (2017) SedCT: MATLABTM tools for standardized and quantitative processing of sediment core computed tomography (CT) data collected using a medical CT scanner, Geochemistry, Geophysics, Geosystems. DOI: <a href="http://dx.doi.org/10.1002/2017GC006884">10.1002/2017GC006884</a>

## Version Log:

#### 10-28-2020: SedCT v 1.06
– Update to allow more flexibility in which slice is used to generate the core image

– Modified to prevent errors associated with different metadata formats and fix minor bugs.

#### 07-16-2019: SedCT v 1.05
-Modified to prevent errors when unnecessary files are included in the DICOM directory.

#### 10-26-2018: SedCT v 1.04
-Modifications to rescale pixel values to HU values.  This change will not impact DICOM files in the standard Oregon State University format, but will rescale output from some other systems that store pixel values differently using the DICOM file metadata.

#### 8-31-2017: SedCT v 1.03
-Modifications made to allow SedCT to work with DICOM files that use different metadata fields than the Oregon State University system.

-Modification to SedCTimage to address issue with exported *.png files in MATLAB versions 2016 and more recent.

#### 8-30-2017: SedCT v 1.02
-New error messages added for reported problem.  Thanks to J. Howarth for feedback!

#### 6-13-2017: SedCT v 1.01
-Minor changes to terminology and code following recommendations by reviewer.

#### 2-21-2017: SedCT v 1.0
-Software uploaded to www.osu-mgr.org website prior to submission to G-Cubed as a technical report.  Includes 1.0 version of SedCT and SedCTimage, user guide, and scale bars.  An example DICOM file of a lake sediment core was also uploaded.
		`}</MDXWrapper>
	);
};

const CoreLyzer: FunctionComponent = () => {
	return (
		<MDXWrapper>{`
We employ the Corelyzer software at the repository as a useful tool for visualizing sediment cores and associated data. Download the software here: Corelyzer Software

From their website:
“Corelyzer is a free, open source application for core image and data visualization. It is available for macOS and Windows.
Corelyzer, sometimes called “CoreWall”, enables fast and reliable inspection of core lithologies and associated data at any location and scale, minimizing the need for repeated core handling, while improving and facilitating interpretation. Corelyzer handles thousands of full-resolution core images efficiently, and runs on nearly any Mac or Windows laptop or desktop.

Corelyzer was originally developed by E. Ito, S. Higgins, C. Jenkins, J. Leigh, and A. Johnson. CSDCO/LacCore developments have yielded major improvements to Corelyzer in recent years through continual feedback from facility visitors and the community at large. These efforts have enabled full utilization of the software for every project team that visits the facility and by an increasing range of institutions around the globe.”
		`}</MDXWrapper>
	);
};

const EducationOutreach: FunctionComponent = () => {
	return (
		<MDXWrapper>{`
<Image bordered rounded size='medium' floated='right' src='cara-demo.jpg' style={{ clear: 'right' }}/>

*Please note: We are currently not accepting visitors or providing tours of our facility. You can however find new virtual interactive tours of the repository here. Feel free to email staff with any questions (osu-mgr@oregonstate.edu).*

# Education and Outreach
Outreach is an important part of what we do at the OSU-MGR. Housing 22 miles of cores and 10,000 rocks from around the world’s oceans allows us to use this unique resource to ignite the imagination of the next generation of earth and ocean scientists.

<Image bordered rounded size='medium' floated='right' src='core-lab-tour.jpg' style={{ clear: 'right' }}/>

Please email the OSU-MGR staff (osu-mgr@oregonstate.edu) if you are interested in a tour of the repository.

Tours and outreach activities cover a wide variety of topics and can be tailored to the group. Recent activities have hosted both K-12 and undergraduate and postgraduate groups.

A typical educational visit lasts approximately 1 hour, and begins with a presentation of how we collect the cores in our collection, followed by a tour of the facilities so students can see where we house our collection, including our 10,900 sq-ft refrigerator. Following the facility tour, there are opportunities to view cores from all over the world. Hands-on activities include using microscopes to view microfossils, simulating coring with mini-cores and mud cakes, and mapping exercises.

<Image bordered rounded size='medium' floated='right' src='core-lab-tour-students.jpg' style={{ clear: 'right' }}/>

Our collections cover time periods ranging from sediment deposited on the ocean floor in the last few years to sediments that are millions of years old giving students the opportunity to learn about ocean processes occurring in different places and over multiple time scales.

# Testimonials

“Dear Core Lab. Thank you again for presenting at the Midsummer Conference. The students found your workshop informative and really interesting. They liked the chance to do hands-on activities, your workshop in particular got great reviews and one student called it one of the best highlights of his whole summer! Way to go!”  
–Apprenticeships in Science and Engineering Coordinator

“Dear Core Lab. On behalf of the SED 513/514 class I would like to thank you for your discussion, tour, and hands on activity for the class. This opportunity allowed the class to grasp the enormity of data collection and analysis when conducting scientific research.”  
–SED 513/514 Instructor
		`}</MDXWrapper>
	);
};

const Page: FunctionComponent<{ pagesContent: any; site: any }> = ({
	pagesContent,
	site,
}) => {
	if (!site || !pagesContent) return <></>;
	const router = useRouter();
	const { pagesPath } = router.query;
	const pagesPaths: string[] = Array.isArray(pagesPath)
		? pagesPath
		: [pagesPath];
	const path = `/${pagesPaths.join('/')}`;
	const [pagesData, pagesForm] = useGithubJsonForm(pagesContent, {});
	usePlugin(pagesForm);
	const [siteData, siteForm] = useGitHubSiteForm(site);
	useFormScreenPlugin(siteForm);
	const tempPages = {
		'/staff': Staff,
		'/facility-history': FacilityHistory,
		'/services': Services,
		'/request-samples': RequestSamples,
		'/sedct': SedCT,
		'/corelyzer': CoreLyzer,
		'/education-outreach': EducationOutreach,
	};
	let navSiblings;
	siteData &&
		siteData['navigation'] &&
		siteData['navigation'].forEach((navItem) => {
			navItem &&
				navItem.menu &&
				navItem.menu.forEach((menuItem) => {
					if (menuItem.link === path) {
						navSiblings = navItem.menu;
					}
				});
		});
	return (
		<Layout navigation={siteData.navigation}>
			<Head siteTitle={siteData['siteTitle']} pageTitle={''} />
			{navSiblings && (
				<Semantic.Menu secondary pointing stackable>
					{navSiblings.map((sibling) => (
						<Semantic.MenuItem
							key={sibling.id}
							as='a'
							href={sibling.link}
							active={sibling.link === path}
						>
							{sibling.text}
						</Semantic.MenuItem>
					))}
				</Semantic.Menu>
			)}
			{tempPages[path] && tempPages[path]()}
			{!tempPages[path] && pagesData.pages && pagesData.pages[path] && (
				<>{path}</>
			)}
			{!tempPages[path] && (!pagesData.pages || !pagesData.pages[path]) && (
				<Semantic.Container style={{ display: 'flex', height: '50vh' }}>
					<Semantic.Message
						error
						size='large'
						icon='warning'
						header='Error 404'
						content='This page is not found.'
						style={{ margin: 'auto', width: 'auto' }}
					/>
				</Semantic.Container>
			)}
		</Layout>
	);
};

export default Page;

export const getStaticPaths: GetStaticPaths = async function () {
	return {
		paths: [],
		fallback: true,
	};
};

export const getStaticProps: GetStaticProps = async function ({
	preview,
	previewData,
}) {
	if (preview) {
		const pagesContent = await getGithubPreviewProps({
			...previewData,
			fileRelativePath: 'content/pages.json',
			parse: parseJson,
		});
		const site = await getGithubPreviewProps({
			...previewData,
			fileRelativePath: 'content/site.json',
			parse: parseJson,
		});

		return {
			props: {
				preview,
				pagesContent: pagesContent.props.file,
				site: site.props.file,
				error: pagesContent.props.error || site.props.error || null,
			},
		};
	}
	return {
		props: {
			sourceProvider: null,
			error: null,
			preview: false,
			pagesContent: {
				fileRelativePath: 'content/pages.json',
				data: (await import('../content/pages.json')).default,
			},
			site: {
				fileRelativePath: 'content/site.json',
				data: (await import('../content/site.json')).default,
			},
		},
	};
};
