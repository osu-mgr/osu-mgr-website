import { FunctionComponent } from 'react';
import { getGithubPreviewProps, parseJson } from 'next-tinacms-github';
import { GetStaticPaths, GetStaticProps } from 'next';
import { usePlugin, useFormScreenPlugin } from 'tinacms';
import { useGithubJsonForm } from 'react-tinacms-github';
import { useGitHubSiteForm } from '../common/site';
import SemanticMDX from '../components/semantic-mdx';
import Head from '../components/head';
import Layout from '../components/layout';
import { useRouter } from 'next/router';
import { Menu, Container, Message } from 'semantic-ui-react';

const Staff: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
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
		`}</SemanticMDX>
	);
};

const Policies: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
<center>

# **Oregon State University**

# **Marine and Geology Repository**

### Supporting Earth, Ocean, and Antarctic Sciences

## Collection Management Policies

### Last updated October 26, 2020

# DRAFT

</center>

---

## Table of Contents

[1. INTRODUCTION](#introduction)

[2. MISSION](#mission)

[3. PURPOSE](#purpose)

[4. SCOPE OF COLLECTIONS](#scope)

[5. CODE OF CONDUCT](#code)

[6. ACCESSION POLICY](#accession)

[7. DEACCESSION POLICY](#deaccession)

[8. STORAGE CONDITIONS](#storage)

[9. SAMPLE REQUESTS](#requests)

[10. SUBMISSION DOCUMENTS](#submission)

[11. ARCHIVE HALF REQUESTS](#archive)

[12. APPROVAL OF REQUEST](#approval)

[13. SAMPLING](#sampling)

[14. SAMPLE SHIPMENT](#shipment)

[15. INSTRUMENTATION](#instrumentation)

[16. DATA AND SAMPLE MORATORIUM](#moratorium)

[17. FACILITY ACKNOWLEDGEMENT](#acknowledgement)

[18. CURATORIAL ADVISORY BOARD](#board)

[19. FACILITY ACCESS](#access)

[20. OUTREACH](#outreach)


---

# 1. INTRODUCTION<a name="introduction"/>


We are the Marine and Geology Repository, a research facility of Oregon State University (OSU-MGR) that supports Earth, Ocean, and Antarctic sciences. In our facility we host geological collections acquired since the 1960&#39;s of sediment and rock cores, dredge and ROV samples. We provide advanced instrumentation for analyses of these materials.

These collections are made accessible to the U.S. community and beyond and have grown through the years from major additions and collections of opportunity from research funded through other resources and donated to the repository to support our mission. These programs include Marine Geology and Geophysics and Polar Programs at NSF, NOAA, DOE-NETL, USGS, and DOGAMI. Additionally, we serve OSU and CEOAS researchers as well as the wider research community by providing sample storage and research facilities with the understanding that these materials will be donated to the facility for curation and subsample distribution after a moratorium period.

As stewards of these invaluable collections we curate using best practices and distribute samples upon request to all qualified users for research and/or education. Our goal is to make the collections more accessible and discoverable, both physically and digitally. This document is designed to clarify the policies regarding the diverse activities within our facility and curation of the collections to support the scientific community now and in the future.

---

# 2. MISSION<a name="mission"/>

Our mission is to facilitate research, education, and the advancement of scientific knowledge through access and preservation of our diverse collection of rock, lake, and marine sediment samples from around the world&#39;s oceans, including the Arctic and the Southern Oceans.

---

# 3. PURPOSE<a name="purpose"/>

The purpose of the repository is to curate our collections and associated datasets in order to facilitate modern science and research. To do this we work to:

- **expand** and **preserve** the collections using best practices for future research and education.

- **distribute** geological subsamples from our collections for future research and education.
- **promote** access to our diverse collections via our outreach program and state-of-the-art web and data services.

---

# 4. SCOPE OF COLLECTIONS<a name="scope"/>

Several collections of geological samples from around the world are housed at OSU-MGR. Most collections are made up of samples taken during research cruises. While ocean sediment samples and rocks are a focus of our collections, we also house terrestrial core samples and hand samples from various field campaigns. The five major collections of the OSU-MGR are listed below:

- **Marine Geology &amp; Geophysics Collection:** Marine sediment cores and rocks collected on research cruises funded by NSF Marine Geology &amp; Geophysics. This global collection was initiated in the 1960&#39;s, and includes the Marine Geology collection donated from the University of Washington.
- **Antarctic Core Collection:** Geological samples collected in and around the Southern Ocean funded by NSF Polar Programs since the 1960&#39;s. The collection includes marine sediment as well as rock drill cores, collected on research cruises or from the ice of Antarctica.
- **NOAA hosted Marine Rock Collection:** This collection is comprised of seafloor rocks collected from NOAA research cruise dredging as well as ROV dive samples from the Ocean Explorer Program.
- **Oregon Drill Core Collection:** rock cores via diamond drilling collected around the state of Oregon, donated to the OSU-MGR from DOGAMI and other private donors.
- **Research Collections** : These geological samples are collected by Principal Investigators for active research projects. These samples also serve as a permanent record for these research activities for cases in which no other appropriate repository currently exists.

---

# 5. CODE OF CONDUCT<a name="code"/>

OSU-MGR follows the Oregon State University [Code of Ethics](https://leadership.oregonstate.edu/sites/leadership.oregonstate.edu/files/190118_adopted_university_code_of_ethics.pdf).

---

# 6. ACCESSION POLICY<a name="accession"/>

Acquiring new samples to the collections is central to the role of the OSU-MGR. Potential donations must be evaluated by OSU-MGR staff. If the samples meet the repository&#39;s standard criteria, they will be formally accessioned into the OSU-MGR collections. The criteria used in evaluating a potential acquisition include:

- Do these specimens align with the OSU-MGR mission, purpose, and scope of collections?
- Is the repository able to properly curate (document, store, preserve, share) the samples?
- Do the samples contain the necessary and accurate metadata (identifiers, geospatial information, sample lengths and depths, date of collection)?
- Does the sample require special care (e.g. toxic, harmful, hazardous, unique temperature/humidity)? Is the repository capable of providing those resources?

**6.1 Donor Responsibilities**

Donors must fulfill all requirements by providing clear and structured data in relation to the samples submitted to the repository. These obligations provide essential information that allows the facility to adequately provide services and samples for years to come.

- Each sample must be clearly labeled with an identifier that matches with listed identifiers in submitted metadata. Samples will be renamed per the repository nomenclature.
- Samples cannot enter the facility until the metadata has been reviewed by OSU-MGR staff. A metadata sheet can be downloaded from the OSU-MGR website. Basic metadata includes: identifiers, geospatial information, sample lengths and depths, date of collection
- Copies of any and all ancillary data (e.g. descriptions, photos, MST, photomicrographs, CT scan data, XRF data) associated with the set of samples, including pdfs of relevant publications, should be submitted with the request for accession, including storage history whenever possible.
- The repository requests that thin sections associated with rock sample donations are also transferred to OSU-MGR.
- In the event that the donor has assigned IGSNs to the samples in advance, the donor must transfer ownership of those identifiers to OSU-MGR.
- The repository only accepts processed samples on a case-by-case basis upon review of the curators.
- Copies of all permits associated with a sample collection must be submitted to OSU-MGR; in cases where appropriate permits will be transferred to OSU-MGR.
- Tracer analyses conducted concurrently with sample processing must be disclosed to the repository at the initial point of contact. Samples must be swabbed for radiocarbon contamination, and official laboratory results must be submitted to the repository prior to shipment to Corvallis. Shipments of samples without laboratory results will be refused, as they present a threat to the integrity of all OSU-MGR collections.

At all times the OSU-MGR reserves the right to refuse to acquire any set of samples, if the samples have not been processed accordingly and are incompletely documented. The submitted metadata form must be approved by repository staff before samples can be delivered. Staff may partially approve of a list of samples proposed for accession (e.g. remove duplicates, remove samples because of missing or poor metadata, availability of associated datasets, amount of space per researcher). In addition, rock and sediment samples that are too large or too heavy will be subsampled by the OSU-MGR.

Once approved for accession, the samples will be formally transferred into the OSU-MGR collections. These collections will be curated in perpetuity, and as such will be made findable and accessible per the mission of the repository. OSU will register the samples with the System for Earth Sample Registration ([SESAR](http://www.geosamples.org/)) in order to acquire an International Geo Sample Number ([IGSN](https://www.igsn.org/), a globally unique and persistent identifier) for each sample.

---

# 7. DEACCESSION POLICY<a name="deaccession"/>

Deaccession will remove a sample physically from the inventory of the OSU-MGR repository. Following deaccession, samples will be disposed of by appropriate means. Disposal may consist of transfer to a more appropriate repository, removing the sample(s) from the main research collections to outreach collection status, or donation to teaching collections. A record of the deaccession will be made in the database. The criteria used in evaluating a potential deaccession include:

- Is the sample relevant to the OSU-MGR&#39;s mission and purpose?
- Is there enough data available to make the sample useful to the community?
- Does the sample require special care (e.g. toxic, harmful, hazardous, unique temperature/humidity)? Is the repository capable of providing those resources?
- Has the sample deteriorated beyond usefulness?
- Does the item duplicate other objects in the collection?
- Do the duties required for curating the sample place an unreasonable burden on OSU-MGR staff and/or budget resources?
- Was the sample initially collected with federal or state funding?

---

# 8. STORAGE CONDITIONS<a name="storage"/>

There are three main storage areas within the repository, each with its own set of storage conditions appropriate for preservation of specific sample types. In all cases, the facility includes a backup generator, temperature monitoring, and alarm systems.

**Dry/Rock Storage Areas:** These areas are subject to ambient storage conditions of the Research Way Building. The temperature is not tightly constrained and will vary with the temperature and humidity conditions of Corvallis, Oregon throughout the year. The rock drill core, rock samples, and dry sediment cores are stored in this area.

**Cold Room:** This is the storage area for the repository&#39;s sediment core collections. The room maintains a temperature of 36-40°F. These conditions are appropriate for the preservation of sediment cores such that they will not freeze nor desiccate, and will slow any growth of mold.

**Freezer:** This storage area maintains a constant -19°F/-25°C. This storage area is appropriate for samples that must remain frozen, such as permafrost cores.

---

# 9. SAMPLE REQUESTS<a name="requests"/>

The OSU-MGR sample request policies and procedures ensure that sample records, data, and publications are all preserved such that the repository will be able to generate access for all collections in perpetuity to serve the research community.

As an NSF/NOAA/OSU funded facility, the OSU-MGR (and therefore PI&#39;s who curate their samples) follows [Sample and Data Policies](https://www.nsf.gov/geo/geo-data-policies/index.jsp). Sample and data requests from our collections are provided to qualified scientific investigators upon receipt of well-documented requests. Materials for educational purposes and museum displays may also be available in limited quantities.

Initial requests should be considered a survey to determine if more samples will be required later. Large requests may require more justification. Subsequent sample requests during the same investigation should include an additional statement describing progress of the study and stating the need for additional material. Student requests should be submitted through their academic advisor.

---

# 10. SUBMISSION DOCUMENTS<a name="submission"/>

We require that requestors submit two documents with their sample request:

1. **Initial Statement of Proposed Research**  
  Investigators should submit a letter (PDF format) to request samples. This letter should include a short outline of the intended studies, detailed methods, research objectives, and names and addresses of collaborating investigators. Given that many samples in the collection are irreplaceable, it is requested that special attention is given to the rationale of what to sample, how much, how many samples, and in some cases, the return of unused materials. Please review all images and descriptions prior to requesting samples. Maximum two pages. The statement must include a two-page CV or NSF-style biosketch for the PI and/or students and other scientists, if applicable.
  
2. **Sample Request Sheet**  
  The sample request sheet is required for a successful request, as it provides the repository with the necessary context for properly documenting a sampling event.  
  a. FOR CORE SAMPLES: Please download and use the [Sediment Core Sample Request Sheet](/Sample-Request-Form.xlsx) to detail the samples you are requesting.  
  b. FOR ROCK SAMPLES: Please download, fill out and submit the [Rock Sample Request Form](/Rock-Request-Form.xlsx) to detail the samples you are requesting.  
    i. _Note about Thin Sections_  
      Some samples contain a prepared petrographic thin section. These sections are available to borrow upon request. Given that high resolution plane-polarized and cross-polarized photos of these thin sections are already available in the OSU-MGR database, we ask that thin sections only be requested if SEM, EMP, FTIR or similar experiments are to be undertaken. Indicate if the thin sections will be coated and with what material in the sample request letter. We require that thin sections will be returned to the repository within two years or upon completion of the proposed research project.

---

# 11. ARCHIVE HALF REQUESTS<a name="archive"/>

Cores are split into two identical halves after retrieval, the working half and the archive half. While the working half is available for sampling to facilitate scientific objectives, the archive half is intended to remain as a pristine stratigraphic record of the material recovered. All the non-destructive analyses are usually made on the archive half (e.g. magnetic susceptibility, gamma ray density, line scan images, XRF-scans, CT-scans). Once the working half has been depleted, the archive half may need to be sampled. In these instances, a careful decision will be made by the repository staff to determine if the proposed science and sampling plan justifies sampling of the archive half of the core. In order to preserve the most complete record of the core the OSU-MGR requires that all non-destructive analysis must be completed on the section prior to sampling. Some of this is routine curation practice and has no cost to the person(s) requesting samples, others are not and will incur costs to the person(s) making the request.

- MSCL data – if not already collected
- Line Scan Image – routine curation
- CT-Scan – charged to proponent
- Itrax Core Scanner (image, x-radiograph, XRF) – charged to proponent

This policy is expected to evolve as new techniques develop and become beneficial to the communities who work with OSU-MGR collections.

---

# 12. APPROVAL OF REQUEST<a name="approval"/>

Sample requests are forwarded to the curators for approval. In cases of conflict of interest,

- Principal investigators who obtained materials are consulted to verify whether or not they are still working on requested materials.
- Conflicts between different investigators requesting the same samples for the same purpose are mediated and resolved by consultation.
- The MGR advisory committee will be consulted.

---

# 13. SAMPLING<a name="sampling"/>

The staff of the OSU-MGR will take the requested samples, or researchers may take their own samples under staff supervision. We request that researchers with large sample requests (&gt;100) come to the repository to collect their samples.

Samples will be taken so that a continuous vertical portion of the core remains in the work half whenever possible. In general, the archive half is reserved for non-destructive analyses in order to preserve the original stratigraphy of the core. (See &quot;Archive Half Requests&quot;.)

---

# 14. SAMPLE SHIPMENT<a name="shipment"/>

The MGR pays for shipping of samples within the United States. International researchers should plan to submit a shipping account number prior to sampling.

---

# 15. INSTRUMENTATION<a name="instrumentation"/>

Users must be trained for use of OSU-MGR equipment by staff. Additional safety training may be required for use of an instrument via OSU EH&amp;S. Users are required to [pay for use of instrumentation](/services) and associated technician time per current fee schedules available online at the repository&#39;s webpage. Users should let staff know if an instrument is not working properly or data quality is suspect.

---

# 16. DATA AND SAMPLE MORATORIUM<a name="moratorium"/>

The OSU-MGR adheres to the standard NSF [Sample and Data Policies](https://www.nsf.gov/geo/geo-data-policies/index.jsp).

After a standard (two year) moratorium, all sample materials housed at OSU-MGR and data created at the facility will be made publically available to the Earth science community. Extensions of this moratorium period may be possible and can be requested by Principal Investigators via email to the relevant funding agency (cc&#39;ing OSU-MGR). The sample collectors will have direct and sole access to those samples during a moratorium period.

- Copies of all data generated in house on all accessioned samples will be retained and linked to the sample record in the repository&#39;s data management system. The standard 2-year moratorium applies to data collected in-house.

- In addition to copies of associated publications related to samples collected from the OSU-MGR collections, copies of any analytical results (tabular data, and DOIs if available) generated from sampled core must be submitted to the MGR upon two years after the date of the sampling event.

---

# 17. FACILITY ACKNOWLEDGEMENT<a name="acknowledgement"/>

- We request that the OSU-MGR be acknowledged as the source of the sample material and/or provider of related analytical data in any publication that contains results from studies of the collections. Use OSU-MGR sample identifiers, location, and sample depths so that future researchers will be able to locate materials for additional investigations.
- By acceptance of these policies, users agree to the repository&#39;s policy on acknowledgement in, and notification of, publications related to work conducted here.
- All lab users should acknowledge the facility in their publications and presentations. Including the facility in your acknowledgements helps to spread the word about our services, and is crucial to the continued funding of the program. When the results of an OSU-MGR assisted project are published in journals, book chapters, conference proceedings, or theses, we request that the manuscript include an acknowledgement similar to the following: **[Cores are archived at / Samples provided by] Marine and Geology Repository, College of Earth, Ocean, and Atmospheric Sciences, Oregon State University.**
- In talks, we request an acknowledgement similar to the following: **Assistance provided by Marine and Geology Repository, Oregon State University.**
- In addition, when a project is complete, we request that all users provide us with a copy (preferably pdf or other electronic format) of any resulting manuscripts, which we will keep for our records. This, too, is important for the continuation of our facility.
- Users are also asked to consider including extensive assistance provided by facility staff in their acknowledgements.

---

# 18. CURATORIAL ADVISORY BOARD<a name="board"/>

Members of the advisory board provide input and oversight on policy development and implementation, direction of the repository, as well as general operational feedback. Specifically, the board may also provide guidance in the event of conflicting sample and/or data-related requests, archive half requests, moratorium inquiries, or deaccession efforts.

The charge of this committee is to:

- Establish long-term goals for the curation of the collections in the OSU-MGR.
- Formulate policy recommendations and deaccessioning guidelines (if deemed necessary) for the OSU-MGR.
- Make recommendations about allocating resources in support of the OSU-MGR mission.
- Help promote and facilitate the use of the OSU-MGR facility in national and international science programs, facilities and meetings.
- Encourage research, education and outreach efforts of the OSU-MGR.
- Assist in exploring and planning new initiatives through OSU-MGR workshops.

**Antarctic Core Collection Advisory Committee (ACCAC):**

Dr. Carlota Escutia, University of Granada, Spain  
Dr. David Harwood, University of Nebraska  
Dr. Alan Mix, Oregon State University (liaison: Marine Geology and Geophysics Advisory Committee)  
Dr. Amelia Shevenell, University of South Florida  
Dr. Reed Scherer, Northern Illinois University  

**Marine Geology and Geophysics Advisory Committee (MGGAC):**

Dr. Alan Mix, Oregon State University  
Dr. Elisabeth Sikes, Rutgers University  
Dr. Marta Torres, Oregon State University  
Dr. Frank Tepley, Oregon State University  
Dr. Mitch Lyle, Oregon State University  
Dr. Maureen Walczak, Oregon State University  

---

# 19. FACILITY ACCESS

- Mailing Address:
  - OSU Marine and Geology Repository  
    4700 SW Research Way  
    Corvallis, Oregon 97333
- Working at the repository during staff hours (9 AM – 5 PM Monday-Friday) is required unless arrangements are made in advance, resources are reserved, and the user has been trained within the last several months (sampling procedures and instrumentation).
- Off-hours use requirements:
  - Training
    - Visitor orientation: visitors will follow instructions of OSU-MGR staff
    - Instrument specific training
    - EHS safety requirements, as applicable
  - Key checkout/return
    - Return key at end of visit (lock inside lab in a designated space)
- Must fill out visitor application request form online:  
  [https://www.cognitoforms.com/OregonStateUniversity1/OSUMGRVisitorApplication](https://www.cognitoforms.com/OregonStateUniversity1/OSUMGRVisitorApplication)
- OSU Facility Use Agreement
  - Acknowledgement of Risk and Waiver of Liability
  - Groups:  
    [https://risk.oregonstate.edu/files/OSU_AcknowledgementofRiskandWaiverofLiability_group.docm](https://risk.oregonstate.edu/files/OSU_AcknowledgementofRiskandWaiverofLiability_group.docm)
  - Individuals:  
    [https://risk.oregonstate.edu/files/OSU_AcknowledgementofRiskandWaiverofLiability_individual.docm](https://risk.oregonstate.edu/files/OSU_AcknowledgementofRiskandWaiverofLiability_individual.docm)

---

# 20. OUTREACH<a name="outreach"/>

Outreach is an important part of what we do at the OSU-MGR. Educational visits (including K-12 field trips and OSU undergraduate/graduate labs) may be scheduled by request with the MGR staff subject to availability of the staff and facility. These visits typically include touring the facility as well as viewing representative cores. These representative &quot;tour cores&quot; have been chosen to show a variety of ocean sediments and must remain at the MGR to ensure proper care. The repository has [several outreach activities](/education-outreach) that may be used off-site, either by MGR staff or loaned out upon request for use in classrooms or at public events. Additionally, there are virtual online options on the MGR website that provide videos and core information for use when in-person visits are not possible.
		`}</SemanticMDX>
	);
};

const OversightCommittee: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
**Antarctic Core Collection Advisory Committee (ACCAC):**

Dr. Carlota Escutia, University of Granada, Spain  
Dr. David Harwood, University of Nebraska  
Dr. Alan Mix, Oregon State University (liaison: Marine Geology and Geophysics Advisory Committee)  
Dr. Amelia Shevenell, University of South Florida  
Dr. Reed Scherer, Northern Illinois University  

**Marine Geology and Geophysics Advisory Committee (MGGAC):**

Dr. Alan Mix, Oregon State University  
Dr. Elisabeth Sikes, Rutgers University  
Dr. Marta Torres, Oregon State University  
Dr. Frank Tepley, Oregon State University  
Dr. Mitch Lyle, Oregon State University  
Dr. Maureen Walczak, Oregon State University  	
		`}</SemanticMDX>
	);
};

const Parking: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
<Image bordered rounded size='large' floated='right' src='parking.png' style={{ clear: 'right' }}/>

# Parking

There is ample parking on the west side of the building. 
The first parking lot is reserved for Printing and Mailing Services. 
Feel free to park anywhere else in the second parking lot. 
Parking is free and does not require a campus parking permit.
		`}</SemanticMDX>
	);
};

const FacilityHistory: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
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
	
		`}</SemanticMDX>
	);
};

const VirtualTour: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
<Image bordered rounded size='large' floated='right' src='original-core-fridge.png' style={{ clear: 'right' }}/>

# Facility History

Since 1960, the College of Earth, Ocean and Atmospheric Sciences (CEOAS) at Oregon State University (OSU) has maintained an active program in Marine Geology, and CEOAS continues to be one of the leading oceanographic institutions involved in exploration, research and the collection of marine samples. To preserve these materials for future research, Drs. Ted C. Moore and LaVerne Kulm in 1971 established the OSU Core Lab, now known as the OSU Marine and Geology Repository.


		`}</SemanticMDX>
	);
};

const Services: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
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

		`}</SemanticMDX>
	);
};

const RequestSamples: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
At the OSU Marine and Geology Repository (OSU-MGR) we distribute thousands of sediment and hard rock samples on an annual basis to researchers all over the world. Instructions on how to request these samples from the OSU-MGR and our Sample and Data Policies are detailed below. Please go step-by-step through the following six steps:

**Step 1:** Decide which samples you wish to study and request. You can find an inventory of OSU holdings on the <a href="http://www.ngdc.noaa.gov/geosamples/index.jsp?inst=OSU">Index to Marine and Lacustrine Geological Samples (IMLGS)</a> website and on our <a href="/collections">Main OSU collection</a> and <a href="noaa-ex">NOAA collections</a> pages.

**Step 2:** Read and familiarize yourself with the sample distribution policies and guidelines on how to request samples. Note that these are slightly different for sediment and hard rock requests.

**Step 3:** Download and complete the Sediment and Rock Core Sample Request Form or Dredge and Dive Sample Request Form

**Step 4:** Send the completed form with appropriate documentation (see guidelines above) to the curator at osu-mgr@oregonstate.edu via email.

**Step 5:** If you publish on the samples you request from the OSU-MGR then please acknowledge the OSU-MGR in your manuscript.

**Step 6:** Please send us copies (PDF’s), or links to published content that use samples hosted in our collection.

For more information on how to request samples or how to request samples other than sediments and rocks, please contact us via email at osu-mgr@oregonstate.edu.
		`}</SemanticMDX>
	);
};

const CoreDistributionGuidelines: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
### Introduction
As an NSF-OCE-MGG funded facility, the OSU-MGR (and therefore PI’s who curate their samples) is bound by the <a href="https://www.nsf.gov/pubs/2017/nsf17037/nsf17037.pdf">NSF-OCE data policy</a> for NSF-OCE funded projects. Samples from cores and sediment traps, information on sampling stations, and descriptions of materials from the OSU collection are provided to qualified scientific investigators upon receipt of well-documented requests. Materials for educational purposes and museum displays may also be available in limited quantities.

### Submission Documents
We require that requestors submit two documents with their sample request:

##### Initial Statement of Proposed Research
Investigators should submit a letter (paper or via electronic mail in PDF format) to request samples. Each request should include a short outline of the intended studies, methods, objectives and names and addresses of collaborating investigators. Initial requests should be considered a survey to determine if more samples will be required later. Large requests require justification. Subsequent sample requests during the same investigation should include an additional statement describing progress of the study and stating the need for additional material. Student requests should be submitted through their academic advisor.

##### Sample Request Sheet
Please download and use the [Sediment and Rock Core Sample Request Sheet](/Sample-Request-Form.xlsx) to detail the samples you are requesting. Please be as detailed as possible in filling out this form and consider the following:

- **Sample Location and Position.** Please specify the ship, cruise number, geographic area, core or dredge number, and sample depth in core. Give alternative cores or dredges, and sampling intervals in cores whenever possible. Since surface sediment material is asked for most frequently, many cores no longer have available surface material. Subsurface samples are usually available.

- **Size of Samples.** Indicate the minimum sample weight or volume needed. The usual sample size for sediment cores is about 5 cc (about 8-12 grams, depending upon sediment type, or an approximately 1.0 cm thick quarter section of split core). Larger sample volumes must be justified. Samples from core tops are often restricted to 1 cc (2 grams). Larger sample volumes may be available from box cores, kasten cores or large diameter gravity cores.

### Special Note for Archive Half Requests
Cores are split into two identical halves after retrieval, the working half and the archive half. While the working half is available for sampling to facilitate the scientific objectives the archive half  is intended to remain a pristine ‘archive’ of the material recovered. All the non-destructive analyses are usually made on the archive half (e.g. magnetic susceptibility, gamma ray density, line scan images, XRF-scans, CT-scans etc) leaving it as a permanent record.

However, sometimes the need arises to sample the archive half. This is usually because of complete depletion of the working half. In these instances careful decisions are made by the repository staff as to whether the proposed science and sampling plan justifies sampling of the archive half of the core. If approved sampling of the archive half destroys the pristine nature of the core, preventing further non-destructive measurement.

In order to preserve the most complete record of the core the OSU-MGR has set up a policy for the sampling of pristine archive halves that aims to preserve as much information as possible before sampling:

Before sampling all non-destructive analysis must be completed on the section. Some of this is routine curation practice and has no cost to the person(s) requesting samples, others are not and will incur costs to the person(s) making the request.

- Magnetic Susceptibility – routine curation (both measurements are accomplished on the MST track housed in our seagoing van; when this van is out at sea MST measurements cannot be made and therefore add a significant delay (weeks-months) to the accomplishment of non-destructive analyses and therefore sampling).
- Line Scan Image – routine curation.
- CT-Scan – charged to proponent (see our fees page)
- XRF-scan – charged to proponent (see our fees page)

### Approval, Sampling and Shipping

**Approval of Request.** Sample requests are forwarded to the curators for approval. In cases of conflict of interest, uninvolved faculty are consulted. Principal investigators who obtained materials are consulted if they are still studying requested materials. Conflicts between different investigators requesting the same samples for the same purpose are mediated and resolved by consultation.

**Sampling.** The staff of the OSU Repository will do the sampling or you may do it yourself under their supervision. Please contact the core curator to schedule sampling visits. There is space for sampling, but laboratory space for sample preparation is minimal.

**Sample Shipment.** Samples are normally shipped within two or three weeks after approval.
		`}</SemanticMDX>
	);
};

const DredgeDistributionGuidelines: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
### Introduction

All sample requests need to be submitted through the OSU-MGR online portal. Please browse through the online archive, which provides high resolution petrographic images (whole rocks + thin sections) and detailed descriptions for most samples, and identify and select the samples that support your research project best. In order to request samples, investigators should upload both the standard OSU-MGR rock sample request form (in Excel spreadsheet format) and a written statement of the proposed research in a separate letter (in PDF format).

### Submission Documents

We require that requestors submit two documents with their sample request:
		
##### Statement of Proposed Research

This letter should include a short outline of the intended studies, detailed methods, research objectives, and names and addresses of collaborating investigators. Since many of the submarine rock samples in the OSU-MGR are small in size and/or have been collected at great costs from unique places around the world, it is requested that in the statement special attention is given to the rationale of what to sample, how much, how many samples, and the return of unused materials. Please review all images and descriptions of the rocks prior to requesting samples. Subsequent sample requests during the same investigation should include an additional statement describing progress of the study and stating the need for additional material. Student requests should be submitted through their academic advisor. Maximum two pages. Include your two-page CV or NSF-style biosketch for the PI and/or students and other scientists, if applicable.

##### OSU-MGR Rock Sample Request

Please download, fill out and submit the [Dredge and Dive Sample Request Form](/Rock-Request-Form.xlsx) to osu-mgr@oregonstate.edu. In the form, use the Sample Name (e.g. OSU-EX1504L2-D1-1) shown on the OSU-MGR collection website. Provide a brief summary of the analyses planned for the sample in the Purpose column. State clearly if specific sections of the sample are required (e.g. glassy rinds, fresh or altered rocks sections) in the Material column. Indicate the minimum sample weight (in grams) or volume (in cubic cm or cc) needed in the Sample Size column. Whenever possible, provide alternative dives or dredges, as some samples may not contain enough material to complete the proposed experiments. Please indicate whether it is a primary or alternate sample in the Request Type column. Please specify if any specific sample preparation is required (e.g. no saw marks) in the Comments column.

### Note about Thin Sections

Most samples contain a prepared petrographic thin section that has been polished to 1 µm grit. These sections are available to borrow upon request. As high resolution plane-polarized and cross-polarized photos of these thin sections are already available in the OSU-MGR database, we ask that thin sections only be requested if SEM, EMP, FTIR or similar experiments are to be undertaken. Indicate if the thin sections will be coated and with what material in the sample request letter. We request that thin sections be returned to the repository within two years or upon completion of the proposed research project.

### Approval and Sampling

**Review Process.** The sample request form and research statement will be reviewed by the OSU-MGR curatorial staff and the co-directors. Initial requests for pilot studies should be considered in order to determine if more samples will be required later. Large sample requests (&gt;10 samples) may be subject to a more strenuous review, potentially requiring feedback from outside the OSU-MGR curatorial staff and directors.

**Obligations.** Results from all work on requested samples are expected to be published in a peer-reviewed scientific journal. Please send a PDF of any published data from the samples. Failure to publish data on requested samples may result in the denial of future requests. If the publication obligation cannot be met within three years from the sample request, a written report explaining the reasons for non-publication is expected as is the return of all unused materials. All thin sections requested are to be return within two years.

**Sampling at the OSU-MGR.** You or your student(s) are welcome to come to the facility to subsample the rocks yourself; otherwise we will process and send the requested samples. Please contact us at osu-mgr@oregonstate.edu to establish a date and time for the onsite OSU-MGR sampling visit.
		`}</SemanticMDX>
	);
};

const SedCT: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
<Image bordered rounded size='medium' floated='right' src='sedct.png' style={{ clear: 'right' }}/>

# SedCT v. 1.06
SedCT is a MATLAB based application for quick, user-friendly processing of sediment core CT data, collected on a medical CT scanner.  It was designed for use with products from the Oregon State University College of Veterinary Medicine Toshiba Aquilion 64 Slice medical CT scanner, but has been tested on other medical CT scanner systems  Please contact Brendan Reilly (btreilly@ucsd.edu) with feedback, questions, and issues.

We hope you find these tools useful.  If you do use them, please cite:

- Reilly, B., Stoner, J., Weist J., (2017) SedCT: MATLABTM tools for standardized and quantitative processing of sediment core computed tomography (CT) data collected using a medical CT scanner, Geochemistry, Geophysics, Geosystems. DOI: <a href="http://dx.doi.org/10.1002/2017GC006884">10.1002/2017GC006884</a>

## Download

[SedCT_v1.06.zip](SedCT_v1.06.zip)

[SedCT User Guide](SedCT_1.01_userguide_06-12-2017.pdf)

#### Example DICOM Data:

[Fish Lake, Utah](https://www.sciencedirect.com/science/article/pii/S0277379118306723?dgcid=author#ec-research-data)

[Sediment Core Top Half](SedCT-Top-Half.zip)

[Sediment Core Bottom Half](SedCT-Bottom-Half.zip)

## Version Log:

#### 10-28-2020: SedCT v 1.06

– Update to allow more flexibility in which slice is used to generate the core image

– Modified to prevent errors associated with different metadata formats and fix minor bugs.

#### 07-16-2019: SedCT v 1.05

- Modified to prevent errors when unnecessary files are included in the DICOM directory.

#### 10-26-2018: SedCT v 1.04

- Modifications to rescale pixel values to HU values.  This change will not impact DICOM files in the standard Oregon State University format, but will rescale output from some other systems that store pixel values differently using the DICOM file metadata.

#### 8-31-2017: SedCT v 1.03

- Modifications made to allow SedCT to work with DICOM files that use different metadata fields than the Oregon State University system.

- Modification to SedCTimage to address issue with exported *.png files in MATLAB versions 2016 and more recent.

#### 8-30-2017: SedCT v 1.02

- New error messages added for reported problem.  Thanks to J. Howarth for feedback!

#### 6-13-2017: SedCT v 1.01

- Minor changes to terminology and code following recommendations by reviewer.

#### 2-21-2017: SedCT v 1.0

- Software uploaded to www.osu-mgr.org website prior to submission to G-Cubed as a technical report.  Includes 1.0 version of SedCT and SedCTimage, user guide, and scale bars.  An example DICOM file of a lake sediment core was also uploaded.
		`}</SemanticMDX>
	);
};

const CoreLyzer: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
<a href="https://csdco.umn.edu/resources/software/corelyzer"><Image bordered rounded size='small' floated='right' src='corelyzer_logo.jpg' style={{ clear: 'right' }}/></a>
		
We employ the Corelyzer software at the repository as a useful tool for visualizing sediment cores and associated data. Download the software here: [Corelyzer Software](https://csdco.umn.edu/resources/software/corelyzer)

From their website:
“Corelyzer is a free, open source application for core image and data visualization. It is available for macOS and Windows.
Corelyzer, sometimes called “CoreWall”, enables fast and reliable inspection of core lithologies and associated data at any location and scale, minimizing the need for repeated core handling, while improving and facilitating interpretation. Corelyzer handles thousands of full-resolution core images efficiently, and runs on nearly any Mac or Windows laptop or desktop.

Corelyzer was originally developed by E. Ito, S. Higgins, C. Jenkins, J. Leigh, and A. Johnson. CSDCO/LacCore developments have yielded major improvements to Corelyzer in recent years through continual feedback from facility visitors and the community at large. These efforts have enabled full utilization of the software for every project team that visits the facility and by an increasing range of institutions around the globe.”

<Image bordered rounded src='corelyzer.jpg'/>
`}</SemanticMDX>
	);
};

const EducationOutreach: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
<Message warning size='large' icon>
	<Icon name='warning' />
	<MessageContent>
		<MessageHeader>
			We are currently not accepting visitors or providing tours of our facility.
		</MessageHeader>
		You can however find new virtual interactive tours of the repository here. Feel free to email staff with any questions (osu-mgr@oregonstate.edu).*
	</MessageContent>
</Message>

<Image bordered rounded size='medium' floated='right' src='cara-demo.jpg' style={{ clear: 'right' }}/>

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
		`}</SemanticMDX>
	);
};

const CuratorsMeeting2017: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
The 2017 meeting of the curators of marine, lacustrine, and geological samples was held in Corvallis at the OSU-MGR in April 2017. Below you will find links to the meeting agenda and all the presentations from the meeting. If you have any questions please don’t hesitate to contact us.

[Agenda for 2017 Curators Meeting](/Agenda-for-2017-Curators-Meeting.docx)

---

[2017 Curators Meeting Welcome Anthony Koppers](/2017-Curators-Meeting-Welcome-Anthony-Koppers.pdf)

[Lamont Doherty Core Repository-Nichole Anest](/Lamont-Doherty-Core-Repository-Nichole-Anest.pdf)

[Woods Hole Oceanographic Institute-Jim Broda](/Woods-Hole-Oceanographic-Institute-Jim-Broda.pptx)

[Oregon State University Marine and Geology Repository-Maziet Cheseby](/Oregon-State-University-Marine-and-Geology-Repository-Maziet-Cheseby.pdf)

[WGNHS Mt Horeb Research Collections and Educational Center-Val Stanley](/WGNHS-Mt-Horeb-Research-Collections-and-Educational-Center-Val-Stanley.pdf)

[USGS St Petersburg FL-Kyle Kelso](/USGS-St-Petersburg-FL-Kyle-Kelso.pdf)

[Ohio Sate University Polar Rock Repository- Anne Grunow](/Ohio-Sate-University-Polar-Rock-Repository-Anne-Grunow.pdf)

[Oregon State University Marine and Geology Repository-Rock Collections-Kevin Konrad](/Oregon-State-University-Marine-and-Geology-Repository-Rock-Collections-Kevin-Konrad.pdf)

[URI Marine Geological Samples Laboratory-Katherine Kelley](/URI-Marine-Geological-Samples-Laboratory-Katherine-Kelley.pdf)

[SCRIPPS Institution of Oceanography Geological Collections-Alex Hangersterfer](/SCRIPPS-Institution-of-Oceanography-Geological-Collections-Alex-Hangersterfer.pdf)

[BOSCORF-Suzanne MacLachlan](/BOSCORF-Suzanne-MacLachlan.pdf)

[Role of Repositories-Joe Stoner](/Role-of-Repositories-Joe-Stoner.pdf)

[OSU-CEOAS-Curation at Sea-Mitch Lyle](/OSU-CEOAS-Curation-at-Sea-Mitch-Lyle.pdf)

[CSDCO-LacCore-Kristina Brady Shannon](/CSDCO-LacCore-Kristina-Brady-Shannon.pptx)

[International Ocean Discovery Program-Phil Rumford](/International-Ocean-Discovery-Program-Phil-Rumford.pdf)

[Future of Repositories and Collections-Anthony Koppers](/Future-of-Repositories-and-Collections-Anthony-Koppers.pdf)

[IMLGS-Kelly Stroker](/IMLGS-Kelly-Stroker.pdf)

[Rolling Deck to Repository (R2R)-Bob Arko](/Rolling-Deck-to-Repository-R2R-Bob-Arko.pdf)

[OSU Marine and Geology Repository-IGSNs-QRcodes etc-Rob Hatfield](/OSU-Marine-and-Geology-Repository-IGSNs-QRcodes-etc-Rob-Hatfield.pdf)

[Moving Repositories into the Digital Age- Kerstin Lehnert](/Moving-Repositories-into-the-Digital-Age-Kerstin-Lehnert.pdf)

[Data Discoverability-Anthony Koppers](/Data-Discoverability-Anthony-Koppers.pdf)

[CT presentation-Joe Stoner](/CT-presentation-Joe-Stoner.pdf)

[CSDCO-LacCore-software-Kristina Brady Shannon](/CSDCO-LacCore-software-Kristina-Brady-Shannon.pptx)

[BOSCORF software-Suzanne MacLachlan](/BOSCORF-software-Suzanne-MacLachlan.pdf)

[2017CuratorsMeeting_Minutes](/2017CuratorsMeeting_Minutes.docx)

`}</SemanticMDX>
	);
};

const Publications: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
The OSU-MGR has a long history of assisting with scientific research resulting in over 400 scientific publications. These are also listed  in a [Google Scholar Citation](https://scholar.google.com/citations?hl=en&user=x5lYe50AAAAJ&view_op=list_works) page. If you use our cores and publish the data on them then please drop us an email to keep this page updated!

- Du, J., B. A. Haley, & A. C. Mix. 2020. Evolution of the Global Overturning Circulation since the Last Glacial Maximum based on marine authigenic neodymium isotopes. Quaternary Science Reviews, 241, 106396. doi: https://dx.doi.org/10.1016/j.quascirev.2020.106396


- Hogan, K.A., M. Jakobsson, L. Mayer, B. T. Reilly, A. E. Jennings, J. S. Stoner, T. Nielsen, K. J. Andresen, E. Nørmark, K. A. Heirman, and E. Kamla, 2020. Glacial sedimentation, fluxes and erosion rates associated with ice retreat in Petermann Fjord and Nares Strait, north-west Greenland. The Cryosphere; Katlenburg-Lindau 14: 261–286. doi: https://dx.doi.org/10.5194/tc-14-261-2020


- Jacobel, A. W., R. F. Anderson, S. L. Jaccard, J. F. McManus, F. J. Pavia, and G. Winckler. 2020. Deep Pacific storage of respired carbon during the last ice age: Perspectives from bottom water oxygen reconstructions. Quaternary Science Reviews 230: 106065. doi: https://dx.doi.org/10.1016/j.quascirev.2019.106065


- Jennings, A. E., M.-S. Seidenkrantz, & K.L. Knudsen. 2020. Glomulina oculus, New Calcareous Foraminiferal Species from the High Arctic: A Potential Indicator of a Nearby Marine-Terminating Glacier. Journal of Foraminiferal Research, 50(2), 219–234. doi: https://dx.doi.org/10.2113/gsjfr.52.2.219


- Jennings, A., J. Andrews, B. Reilly, M. Walczak, M. Jakobsson, A. Mix, J. Soner, K. Nicholls & M. Cheseby. 2020. Modern foraminiferal assemblages in northern Nares Strait, Petermann Fjord, and beneath Petermann ice tongue, NW Greenland. Arctic, Antarctic, and Alpine Research, 52(1), 491-511. doi: https://dx.doi.org/10.1080/15230430.2020.1806986


- Mizell, K., J. R. Hein, P. J. Lam, A. A. Koppers, and H. Staudigel. 2020. Geographic and Oceanographic Influences on Ferromanganese Crust Composition Along a Pacific Ocean Meridional Transect, 14 N to 14S. Geochemistry, Geophysics, Geosystems, 21(2), e2019GC008716.


- Peck, E. K., R. A. Wheatcroft, and L. S. Brophy. 2020. Controls on sediment accretion and blue carbon burial in tidal saline wetlands: Insights from the Oregon coast, USA. Journal of Geophysical Research: Biogeosciences 125.2: e2019JG005464.


- Praetorius, S. K., A. Condron, A. C. Mix, M. H. Walczak, J. L. McKay, and J. Du. 2020. The role of Northeast Pacific meltwater events in deglacial climate change. Science Advances 6: eaay2915. doi: https://dx.doi.org/10.1126/sciadv.aay2915


- Walczak, M. H., A.C. Mix, E.A. Cowan, S. Fallon, L.K. Fifield, J.R. Alder, J. Du, B. Haley, T. Hobern, J. Padman, S.K. Praetorius, A. Schmittner, J.S. Stoner, & S.D. Zellers. 2020. Phasing of millennial-scale climate variability in the Pacific and Atlantic Oceans. Science, 370(6517), 716–720. doi: https://dx.doi.org/10.1126/science.aba7096
`}</SemanticMDX>
	);
};

const Publications2010to2019: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
The OSU-MGR has a long history of assisting with scientific research resulting in over 400 scientific publications. These are also listed  in a [Google Scholar Citation](https://scholar.google.com/citations?hl=en&user=x5lYe50AAAAJ&view_op=list_works) page. If you use our cores and publish the data on them then please drop us an email to keep this page updated!

- Clementi, V. J., and E. L. Sikes. 2019. Southwest Pacific vertical structure influences on oceanic carbonstorage since the Last Glacial Maximum. Paleoceanography and Paleoclimatology 34(5): 734-754. doi: https://dx.doi.org/10.1029/2018PA003501


- Glaubke, R. H. 2019. The Evolution of the El Niño-Southern Oscillation and Tropical Pacific Climate Across the Last Deglaciation. M.S. Thesis, Old Dominion University. doi: https://dx.doi.org/10.25777/mk6r-kg66


- Hatfield, R. G., B. H. Wheeler, B. T. Reilly, J. S. Stoner, and B. A. Housen. 2019. Particle Size Specific Magnetic Properties Across the Norwegian-Greenland Seas: Insights into the Influence of Sediment Source and Texture on Bulk Magnetic Records. Geochemistry, Geophysics, Geosystems 20(2):1004-1025. doi: https://dx.doi.org/10.1029/2018GC007894


- Konrad, K., A. A. Koppers, A. M. Balbas, D. P. Miggins, and D. E. Heaton. 2019. Dating Clinopyroxene Phenocrysts in Submarine Basalts Using 40Ar/39Ar Geochronology. Geochemistry, Geophysics, Geosystems, 20(2), 1041-1053. doi: https://dx.doi.org/10.1029/2018GC007697


- Konter, J.G., V. A. Finlayson, J. Engel, M. G. Jackson, A. A. Koppers and S. Sharma, 2019. EXPRESS: Shipboard Characterization of Tuvalu, Samoa, and Lau Dredge Samples Using Laser-Induced Breakdown Spectroscopy (LIBS). Applied Spectroscopy. 73(6):623-637, p.0003702819830793.


- Lund, D. C., F. J. Pavia, E. I. Seeley, S. E. McCart, P. A. Rafter, K. A. Farley, P. D. Asimow, and R. F. Anderson. 2019. Hydrothermal scavenging of 230Th on the Southern East Pacific Rise during the last deglaciation. Earth and Planetary Science Letters 510: 64–72. doi: https://dx.doi.org/10.1016/j.epsl.2018.12.037


- Malevich, S. B., L. Vetter, and J. E. Tierney. 2019. Global Core Top Calibration of δ18O in Planktic Foraminifera to Sea Surface Temperature. Paleoceanography and Paleoclimatology 34: 1292–1315. doi: https://dx.doi.org/10.1029/2019PA003576


- Reilly, B. T., J. S. Stoner, A. C. Mix, M. H. Walczak, A. Jennings, M. Jakobsson, L. Dyke, A. Glueder, K. Nicholls, K. A. Hogan, and L. A. Mayer. 2019. Holocene break-up and reestablishment of the Petermann Ice Tongue, Northwest Greenland. Quaternary Science Reviews 218: 322–342. doi: https://dx.doi.org/10.1016/j.quascirev.2019.06.023


- Saenger, C. P., and M. N. Evans. 2019. Calibration and Validation of Environmental Controls on Planktic Foraminifera Mg/Ca Using Global Core-Top Data. Paleoceanography and Paleoclimatology 34: 1249–1270. doi: https://dx.doi.org/10.1029/2018PA003507


- Sikes, E. L., B. Schiraldi, and A. Williams. 2019. Seasonal and Latitudinal Response of New Zealand Sea Surface Temperature to Warming Climate Since the Last Glaciation: Comparing Alkenones to Mg/Ca Foraminiferal Reconstructions. Paleoceanography and Paleoclimatology 34: 1816–1832. doi: https://dx.doi.org/10.1029/2019PA003649


- Taylor, B. 2019. The North Pacific from glacial to modern: assemblages, isotopes and CO₂. PhD Thesis, University of St Andrews, 2019.


- Thiagarajan, N., and J. F. McManus. 2019. Productivity and sediment focusing in the Eastern Equatorial Pacific during the last 30,000 years. Deep Sea Research Part I: Oceanographic Research Papers. 47:100-110. doi: https://dx.doi.org/10.1016/j.dsr.2019.03.007


- Tierney, J. E., S. B. Malevich, W. Gray, L. Vetter, and K. Thirumalai. 2019. Bayesian Calibration of the Mg/Ca Paleothermometer in Planktic Foraminifera. Paleoceanography and Paleoclimatology 34: 2005–2030. doi: https://dx.doi.org/10.1029/2019PA003744


- Barrientos, N., C.H. Lear, M. Jakobsson, C. Stranne, M. O’Regan, T.M. Cronin, A.Y. Gukov, and H.K. Coxall, 2018. Arctic Ocean benthic foraminifera Mg/Ca ratios and global Mg/Ca-temperature calibrations: New constraints at low temperatures. Geochimica et Cosmochimica Acta, 236: 240-259. doi: https://dx.doi.org/10.1016/j.gca.2018.02.036


- Bhattacharya, T., J. E. Tierney, J. A. Addison, and J. W. Murray. 2018. Ice-sheet modulation of deglacial North American monsoon intensification. Nature Geoscience 11: 848–852. doi: https://dx.doi.org/10.1038/s41561-018-0220-7


- Costa, K. M., J. F. McManus, and R. F. Anderson. 2018. Radiocarbon and Stable Isotope Evidence for Changes in Sediment Mixing in the North Pacific over the Past 30 kyr. Radiocarbon 60: 113–135. doi: https://dx.doi.org/10.1017/RDC.2017.91


- Du, J., B. A. Haley, A. C. Mix, M. H. Walczak, and S. K. Praetorius. 2018. Flushing of the deep Pacific Ocean and the deglacial rise of atmospheric CO 2 concentrations. Nature Geoscience 11: 749. doi: https://dx.doi.org/10.1038/s41561-018-0205-6


- Finlayson, VA., J. G. Konter, K. Konrad, A. A. P. Koppers, M. G Jackson, T. O Rooney. 2018. Sr-Pb-Nd-Hf isotopes and 40Ar/39Ar ages reveal a Hawaii-Emperor style bend in the Rurutu hotspot. Earth and Planteray Science Letters. 500: 168-179. doi: https://dx.doi.org/10.1016/j.epsl.2018.08.020


- Ford, H. L., C. L. McChesney, J. E. Hertzberg, and J. F. McManus. 2018. A Deep Eastern Equatorial Pacific Thermocline During the Last Glacial Maximum. Geophysical Research Letters 45: 11,806-11,816. doi: https://dx.doi.org/10.1029/2018GL079710


- Konrad, K., A. A. P. Koppers, B. Steinberger, V. A. Finlayson, J. G. Konter, and M. G. Jackson. 2018. On the relative motions of long-lived Pacific mantle plumes. Nature communications, 9(1): 854. doi: https://dx.doi.org/10.1038/s41467-018-03277-x


- Lund, D. C., E. I. Seeley, P. D. Asimow, M. J. Lewis, S. E. McCart, and A. A. Mudahy. 2018. Anomalous Pacific-Antarctic Ridge Volcanism Precedes Glacial Termination 2. Geochemistry, Geophysics, Geosystems 19: 2478–2491. doi: https://dx.doi.org/10.1029/2017GC007341


- Napier, T. J., I. L. Hendy, L. A. Hinnov, E. T. Brown, and A. Shevenell. 2018. Subtropical hydroclimate during Termination V (∼430-422 ka): Annual records of extreme precipitation, drought, and interannual variability from Santa Barbara Basin. Quaternary Science Reviews 191: 73–88. doi: https://dx.doi.org/10.1016/j.quascirev.2018.05.003


- Reilly, B. T., J. S. Stoner, R. G. Hatfield, and others. 2018. Regionally consistent Western North America paleomagnetic directions from 15 to 35 ka: Assessing chronology and uncertainty with paleosecular variation (PSV) stratigraphy. Quaternary Science Reviews 201: 186–205. doi: https://dx.doi.org/10.1016/j.quascirev.2018.10.016


- Sinton, C. W., F. Hauff, K. Hoernle, and R. Werner. 2018. Age progressive volcanism opposite Nazca plate motion: Insights from seamounts on the northeastern margin of the Galapagos Platform. Lithos 310–311: 342–354. doi: https://dx.doi.org/10.1016/j.lithos.2018.04.014


- Zhao, N., O. Marchal, L. Keigwin, D. Amrhein, and G. Gebbie. 2018. A Synthesis of Deglacial Deep-Sea Radiocarbon Records and Their (In)Consistency With Modern Ocean Ventilation. Paleoceanography and Paleoclimatology 33(7): 745-65. doi: https://dx.doi.org/10.1002/2017PA003174


- Carlson, A. E., Z. Kilmer, L. B. Ziegler, and others. 2017. Recent retreat of Columbia Glacier, Alaska: Millennial context. Geology 45: 547–550. doi: https://dx.doi.org/10.1130/G38479.1


- Chen, L., D. Heslop, A. P. Roberts, and others. 2017. Remanence acquisition efficiency in biogenic and detrital magnetite and recording of geomagnetic paleointensity. Geochem. Geophys. Geosyst. 18: 1435–1450. doi: https://dx.doi.org/10.1002/2016GC006753


- de la Fuente, M., E. Calvo, L. Skinner, C. Pelejero, D. Evans, W. Müller, P. Povea, and I. Cacho. 2017. The Evolution of Deep Ocean Chemistry and Respired Carbon in the Eastern Equatorial Pacific Over the Last Deglaciation. Paleoceanography 32: 2017PA003155. doi: https://dx.doi.org/10.1002/2017PA003155


- Goldfinger, C., S. Galer, J. Beeson, and others. 2017. The importance of site selection, sediment supply, and hydrodynamics: A case study of submarine paleoseismology on the northern Cascadia margin, Washington USA. Marine Geology 384: 4–46. doi: https://dx.doi.org/10.1016/j.margeo.2016.06.008


- Menounos, B., B. M. Goehring, G. Osborn, and others. 2017. Cordilleran Ice Sheet mass loss preceded climate reversals near the Pleistocene Termination. Science 358: 781–784. doi: https://dx.doi.org/10.1126/science.aan3001


- Napier, T. 2017. Unraveling Santa Barbara Basin Lithogenic Sediment Composition and Application to Southern California Quaternary Hydroclimate. PhD thesis. University of Michigan.


- Walczak, M. H., J. S. Stoner, A. C. Mix, J. Jaeger, G. P. Rosen, J. E. T. Channell, D. Heslop, and C. Xuan. 2017. A 17,000 yr paleomagnetic secular variation record from the southeast Alaskan margin: Regional and global correlations. Earth and Planetary Science Letters 473: 177–189. doi: https://dx.doi.org/10.1016/j.epsl.2017.05.022


- Yang, Y., R. Xiang, J. Liu, S. Fu, L. Zhou, S. Du, and H. Lü. 2017. Changes in intermediate water conditions in the northern South China Sea using Globorotalia inflata over the last 20 ka. J. Quaternary Sci. 32: 1037–1048. doi: https://dx.doi.org/10.1002/jqs.2974


- Zhao, X., A. P. Roberts, D. Heslop, G. A. Paterson, Y. Li, and J. Li. 2017. Magnetic domain state diagnosis using hysteresis reversal curves: Magnetic Domain State Diagnosis by FORCs. Journal of Geophysical Research: Solid Earth 122: 4767–4789. doi: https://dx.doi.org/10.1002/2016JB013683


- Barron, J. A., D. Bukry, J. A. Addison, and T. A. Ager. 2016. Holocene evolution of diatom and silicoflagellate paleoceanography in Slocum Arm, a fjord in southeastern Alaska. Marine Micropaleontology 126: 1–18. doi: https://dx.doi.org/10.1016/j.marmicro.2016.05.002


- Chang, L., A. P. Roberts, D. Heslop, A. Hayashida, J. Li, X. Zhao, W. Tian, and Q. Huang. 2016. Widespread occurrence of silicate‐hosted magnetic mineral inclusions in marine sediments and their contribution to paleomagnetic recording. Journal of Geophysical Research: Solid Earth 121: 8415–8431. doi: https://dx.doi.org/10.1002/2016JB013109


- Du, J., B. A. Haley, and A. C. Mix. 2016. Neodymium isotopes in authigenic phases, bottom waters and detrital sediments in the Gulf of Alaska and their implications for paleo-circulation reconstruction. Geochimica et Cosmochimica Acta 193: 14–35. doi: https://dx.doi.org/10.1016/j.gca.2016.08.005


- Hatfield, R. G., A. V. Reyes, J. S. Stoner, A. E. Carlson, B. L. Beard, K. Winsor, and B. Welke. 2016. Interglacial responses of the southern Greenland ice sheet over the last 430,000 years determined using particle-size specific magnetic and isotopic tracers. Earth and Planetary Science Letters 454: 225–236. doi: https://dx.doi.org/10.1016/j.epsl.2016.09.014


- Hertzberg, J. E., M. W. Schmidt, T. S. Bianchi, R. W. Smith, M. R. Shields, and F. Marcantonio. 2016. Comparison of eastern tropical Pacific TEX86 and Globigerinoides ruber Mg/Ca derived sea surface temperatures: Insights from the Holocene and Last Glacial Maximum. Earth and Planetary Science Letters 434: 320–332. doi: https://dx.doi.org/10.1016/j.epsl.2015.11.050


- Lund, D., P. Asimow, K. Farley, T. Rooney, E. Seeley, E. Jackson, and Z. Durham. 2016. Enhanced East Pacific Rise hydrothermal activity during the last two glacial terminations. Science 351: 478–482. doi: https://dx.doi.org/10.1126/science.aad4296


- Praetorius, S., A. Mix, B. Jensen, D. Froese, G. Milne, M. Wolhowe, J. Addison, and F. Prahl. 2016. Interaction between climate, volcanism, and isostatic rebound in Southeast Alaska during the last deglaciation. Earth and Planetary Science Letters 452: 79–89. doi: https://dx.doi.org/10.1016/j.epsl.2016.07.033


- Sikes, E. L., M. S. Cook, and T. P. Guilderson. 2016. Reduced deep ocean ventilation in the Southern Pacific Ocean during the last glaciation persisted into the deglaciation. Earth and Planetary Science Letters 438: 130–138. doi: https://dx.doi.org/10.1016/j.epsl.2015.12.039


- Allen, K. A., E. L. Sikes, B. Hönisch, A. C. Elmore, T. P. Guilderson, Y. Rosenthal, and R. F. Anderson. 2015. Southwest Pacific deep water carbonate chemistry linked to high southern latitude climate and atmospheric CO2 during the Last Glacial Termination. Quaternary Science Reviews 122: 180–191. doi: https://dx.doi.org/10.1016/j.quascirev.2015.05.007


- Cortese, G., and J. Prebble. 2015. A radiolarian-based modern analogue dataset for palaeoenvironmental reconstructions in the southwest Pacific. Marine Micropaleontology 118: 34–49. doi: https://dx.doi.org/10.1016/j.marmicro.2015.05.002


- Dutkiewicz, A., R. D. Müller, S. O’Callaghan, and H. Jónasson. 2015. Census of seafloor sediments in the world’s ocean. Geology 43: 795–798. doi: https://dx.doi.org/10.1130/G36883.1


- Lopes, C., M. Kucera, and A. C. Mix. 2015. Climate change decouples oceanic primary and export productivity and organic carbon burial. Proceedings of the National Academy of Sciences 112: 332–335. doi: https://dx.doi.org/10.1073/pnas.1410480111


- Praetorius, S., A. Mix, M. Walczak, M. Wolhowe, J. Addison, and F. Prahl. 2015. North Pacific deglacial hypoxic events linked to abrupt ocean warming. Nature 527: 362–366. doi: 10.1038/nature15753


- Davies-Walczak, M., A. C. Mix, J. S. Stoner, J. R. Southon, M. Cheseby, and C. Xuan. 2014. Late Glacial to Holocene radiocarbon constraints on North Pacific Intermediate Water ventilation and deglacial atmospheric CO2 sources. Earth and Planetary Science Letters 397: 57–66. doi: https://dx.doi.org/10.1016/j.epsl.2014.04.004


- Dunnette, P. V., P. E. Higuera, K. K. McLauchlan, K. M. Derr, C. E. Briles, and M. H. Keefe. 2014. Biogeochemical impacts of wildfires over four millennia in a Rocky Mountain subalpine watershed. New Phytologist 203: 900–912. doi: https://dx.doi.org/10.1111/nph.12828


- Jaeger, J. M., and B. Kramer. 2014. A continental shelf sedimentary record of Little Ice Age to modern glacial dynamics: Bering Glacier, Alaska. Continental Shelf Research 86: 141–156. doi: https://dx.doi.org/10.1016/j.csr.2013.03.011


- Lyle, M., F. Marcantonio, W. S. Moore, R. W. Murray, C. Huh, B. P. Finney, D. W. Murray, and A. C. Mix. 2014. Sediment size fractionation and focusing in the equatorial Pacific: Effect on 230Th normalization and paleoflux measurements. Paleoceanography 29: 747–763. doi: https://dx.doi.org/10.1002/2014PA002616


- Mekik, F. 2014. Radiocarbon dating of planktonic foraminifer shells: A cautionary tale. Paleoceanography 29: 13–29. doi: https://dx.doi.org/10.1002/2013PA002532


- Nwaodua, E. C., J. D. Ortiz, and E. M. Griffith. 2014. Diffuse spectral reflectance of surficial sediments indicates sedimentary environments on the shelves of the Bering Sea and western Arctic. Marine Geology 355: 218–233. doi: https://dx.doi.org/10.1016/j.margeo.2014.05.023


- Pichat, S., W. Abouchami, and S. J. G. Galer. 2014. Lead isotopes in the Eastern Equatorial Pacific record Quaternary migration of the South Westerlies. Earth and Planetary Science Letters 388: 293–305. doi: https://dx.doi.org/10.1016/j.epsl.2013.11.035


- Praetorius, S. K. 2014. Abrupt deglacial climate changes in the North Pacific and implications for climate tipping points. PhD thesis. Oregon State University.


- Praetorius, S. K., and A. C. Mix. 2014. Synchronization of North Pacific and Greenland climates preceded abrupt deglacial warming. Science 345: 444–448. doi: https://dx.doi.org/10.1126/science.1252000


- Sinton, C. W., K. S. Harpp, and D. M. Christie. 2014. A Preliminary Survey of the Northeast Seamounts, Galápagos Platform, p. 335–362. In K.S. Harpp, E. Mittelstaedt, N. D’Ozouville, and D.W. Graham [eds.], The Galápagos. John Wiley & Sons, Inc.


- Addison, J, B Finney, J Jaeger, J Stoner, J, R Norris, A Hangsterfer (2013) Integrating satellite observations and modern climate measurements with the recent sedimentary record: An example from Southeast Alaska, Journal of Geophysical Research:Oceans, 118, 3444-3461. doi: https://dx.doi.org/10.1002/jgrc.20243


- Gutierrez-Pastor, J, C H Nelson, C Goldfinger, C Escutia (2013) Sedimentology of seismo-turbidites off the Cascadia and northern California active tectonic continental margins, northwest Pacific Ocean, Marine Geology, 336, 99-119. doi: https://dx.doi.org/10.1016/j.margeo.2012.11.010


- Haley, B, L Polyak (2013) Pre-modern Arctic Ocean circulation from surface sediment neodymium isotopes, Geophysical Research Letters, 40, 893-897. doi: https://dx.doi.org/10.1002/GRL.50188


- Himmler, T, B Haley, M Torres, G Klinkhammer, G Bohrmann, J Peckmann (2013) Rare earth element geochemistry in cold-seep pore waters of Hydrate Ridge, northeast Pacific Ocean, Geo-Marine Letters, 33, 369-379. doi: https://dx.doi.org/10.1007/s00367-013-0334-2


- Roy, M, J McManus, M Goni, Z Chase, J Borgeld, R Wheatcroft, J Muratli, M Megowan, A Mix (2013) Reactive iron and manganese distributions in seabed sediments near small mountainous rivers off Oregon and California (USA), Continental Shelf Research, 54, 67-79. doi: https://dx.doi.org/10.1016/j.csr.2012.12.012


- Singh, A, F Marcantonio, M Lyle (2013) Water column 230Th systematics in the eastern equatorial Pacific Ocean and implications for sediment focusing, Earth and Planetary Science Letters, 362, 294-304. doi: https://dx.doi.org/10.1016/j.epsl.2012.12.006


- Wagner M, I Hendy, J McKay, T Pedersen (2013) Influence of biological productivity on silver and redox-sensitive trace metal accumulation in Southern Ocean surface sediments, Pacific sector, Earth and Planetary Science Letters, 380, 31-40. doi: https://dx.doi.org/10.1016/j.epsl.2013.08.020


- Wheatcroft, R, M Goni, K Richardson, J Borgeld (2013) Natural and human impacts on centennial sediment accumulation patterns on the Umpqua River margin, Oregon, Marine Geology, 339, 44-56. doi: https://dx.doi.org/10.1016/j.margeo.2013.04.015


- White, S, T Hill, J Kennett, R Behl, C Nicholson (2013) Millenial-scale variability to 735 ka: High-resolution climate records from Santa Barbara Basin, CA, Paleoceanography, 28, 213-226. doi: https://dx.doi.org/10.1002/palo.20022


- Ziegler, L, J Stoner (2013) High resolution paleo-geomagnetic field variations as recorded in sediments from Prince William Sound, Alaska, Geophysical Research Abstracts, 15, EGU2013-6677-1.


- Ziegler, L, J Stoner (2012) A paleo- and environmental magnetic record from Prince William Sound, Alaska, Geophysical Research Abstracts, 14, EGU2012-12046.


- Addison, Jason A, B Finney, W Dean, M Davies, A Mix, J Stoner, J Jaeger (2012) Productivity and sedimentary delta15N variability for the last 17,000 years along the northern Gulf of Alaska continental slope, Paleoceanography, 27, PA1206. doi: https://dx.doi.org/10.1029/2011PA002161


- Goldfinger, C, CH Nelson, A Morey, J Johnson, J Patton, E Karabanov, J Gutierrez-Pastor, A Eriksson, E Gracia, G Dunhill, R Enkin, A Dallimore, T Vallier (2012) Turbidite Event History-Methods and Implications for Holocene Paleoseismicity of the Cascadia Subduction Zone, in Earthquake Hazards of the Pacific NW Coastal and Marine Regions, edited by Robert Kayen. USGS Professional Paper 1661-F, 170p.,


- Kienast, M, G MacIntyre, N Dubois, S Higginson, C Normandeau, C Chazen, TD Herbert (2012) Alkenone unsaturation in surface sediments from the eastern equatorial Pacific: Implications for SST reconstructions, Paleoceanography, 27, PA1210. doi: https://dx.doi.org/10.1029/2011PA002254


- Mekik, F, RF Anderson, P Loubere, R Francois, M Richaud (2012) The mystery of the missing deglacial carbonate preservation maximum, Quaternary Science Reviews, 39, 60-72. doi: https://dx.doi.org/10.1016/j.quascirev.2012.01.024


- Newton, Alicia, R Thunell, L Stott (2012) Changes in the Indonesian Throughflow during the past 2000yr, Geology, 39, 63-66. doi: https://dx.doi.org/10.1130/G31421.1


- Salisbury, M, J Patton, A Kent, C Goldfinger, Y Djadjadihardja, U Hanifa (2012) Deep-sea ash layers reveal evidence for large, late Pleistocene and Holocene explosive activity from Sumatra, Indonesia, Journal of Volcanology and Geothermal Research, 231-232, 61-71. doi: https://dx.doi.org/10.1016/j.volgeores.2012.03.007


- Schreiber, K, FJ Stadermann, C Floss, D Rea, M Lyle (2012) Search for Extraterrestrial Particles in Sediment from the South Pacific Bare Zone, 43rd Lunar and Planetary Science Conference, March 19-23, 2012, at The Woodlands, Texas, LPI Contribution No. 1659, id.1112, 1659, 1112.


- Stoynova, VP (2012) Insights into Circum-Arctic Sea Ice Variability from Molecular Geochemistry: The IP25 Index, MS Thesis, University of Texas at Austin, Stoy12, 45pp.


- Davies, Maureen H (2011) Paleoclimate, Paleoventilation, and Paleomagnetism as Recorded in a 17kyr Marine Sediment Record from the SE Alaska Margin, PhD thesis, Oregon State University, 181pp.


- Davies, Maureen H, A Mix, J Stoner, J Addison, J Jaeger, B Finney, J Wiest (2011) The deglacial transition on the southeastern Alaska Margin: Meltwater input, sea level rise, marine productivity, and sedimentary anoxia, Paleoceanography, 26, PA2223. doi: https://dx.doi.org/10.1029/2010PA002051


- Dubois, N, Kienast, M (2011) Spatial reorganization in the equatorial divergence in the Eastern Tropical Pacific during the last 150kyr, Geophysical Research Letters, 38, L16606. doi: https://dx.doi.org/10.1029/2011GL048325


- Dubois, N, Kienast, M, Kienast, S,  Normandeau, C, Calvert, S, Herbert, TD, Mix, A (2011) Millennial-scale variations in hydrography and biogeochemistry in the Eastern Equatorial Pacific over the last 100 kyr, Quaternary Science Reviews, 30, 210-223. doi: https://dx.doi.org/10.1016/j.quascirev.2010.10012


- Gavin, Daniel, A Henderson, K Westover, S Fritz, I Walker, M Jeng, FHu (2011) Abrupt Holocene climate change and potential response to solar forcing in western Canada, Quaternary Science Reviews, 30, 1243-1255. doi: https://dx.doi.org/10.1016/j.quascirev.2011.03.003


- Griggs, Gary Bruce (2011) The First Ocean Floor Evidence of Great Cascadia Earthquakes, EOS, 92, 325-336.


- Jennings, A, Sheldon, C, Cronin, T, Francus, P, Stoner, J, Andrews, J (2011) The Holocene History of Nares Strait Transition from Glacial Bay to Arctic-Atlantic Throughflow, Oceanography, 24, 18-33.


- Khider, D, L Stott, J Emile-Geay, R Thunell, D Hammond (2011) Assessing El Nino Southern Oscillation variability during the past millenium, Paleoceanography, 26, PA3222. doi: https://dx.doi.org/10.1029/2011PA002139


- Kneafsey, T, H Lu, W Winters, R Boswell, R Hunter, T Collett (2011) Examination of core samples from the Mount Elbert Gas Hydrate Stratigraphic Test Well, Alaska North Slope: Effects of retrieval and preservation, Marine and Petroleum Geology, 28, 381-393. doi: https://dx.doi.org/10.1016/j.marpetgeo.2009.10.009


- Lu, H, T Lorenson, I Moudrakovski, J Ripmeester, T Collett, R Hunter, C Ratcliffe (2011) The characteristics of gas hydrates recovered from the Mount Elbert Gas Hydrate Stratigraphic Test Well, Alaska North Slope, marine and Petroleum Geology, 28, 295-310. doi: https://dx.doi.org/10.1016/j.marpetgeo.2010.02.015


- Lund, D, A Mix, J Southon (2011) Increased ventilation age of the deep northeast Pacific Ocean during the last deglaciation, Nature Geoscience Letters, 4, 771-774. doi: https://dx.doi.org/10.1038/NGEO1272


- Nwaodua, EC, JD Ortiz (2011) Late Quaternary Clay Mineral and Iron Oxide Distributions on the Bering and Chukchi Sea Shelves: A Proxy for Ocean Circulation through the Bering Strait, Northeastern (46th Annual) and North-Central (45th Annual) Joint Meeting, March 20-22, 2011, Omni William Penn Hotel, Pittsburgh, PA, 43, 61.


- Rincon-Martinez, D, S Steph, F Lamy, A Mix, R Tiedemann (2011) Tracking the equatorial front in the eastern equatorial Pacific Ocean by the isotopic and faunal composition of planktonic foraminifera, Marine Micropaleontology, 79, 24-40. doi: https://dx.doi.org/10.1016/j.marmicro.2011.01.001


- Rontani, JF, SG Wakeham, FG Prahl, F Vaultier, JK Volkman (2011) Analysis of trace amounts of alkenones in complex environmental samples by way of NaBH4/NaBD4 reduction and silylation, Organic Geochemistry, 42, 1299-1307. doi: https://dx.doi.org/10.1016/j.orggeochem.2011.09.004


- Rose, K, R Boswell, T Collett (2011) Mount Elbert Gas Hydrate Stratigraphic Test Well, Alaska North Slope: Coring operations, core sedimentology and lithostratigraphy, Marine and Petroleum Geology, 28, 311-331. doi: https://dx.doi.org/10.1016/j.marpetgeo.2010.02.001


- Saukel, C, F Lamy, J-B W Stuut, R Tiedemann, C Vogt (2011) Distribution and provenance of wind-blown SE Pacific surface sediments, Marine Geology, 280, 130-142. doi: https://dx.doi.org/10.1016/j.margeo.2010.12.006


- Singh, Ajay K, F Marcantonio, M Lyle (2011) Sediment focusing in the Panama Basin, Eastern Equatorial Pacific Ocean, Earth and Planetary Science Letters, 309, 33-44. doi: https://dx.doi.org/10.1016/j.epsl.2011.06.020


- Addison, Jason A, JE Beget, TA Ager, BP Finney (2010) Marine tephrochronology of the Mt. Edgecumbe Volcanic Field, Southeast Alaska, USA, Quaternary Research, 73, 277-292.


- Colombaroli, Daniele, D Gavin (2010) Highly episodic fire and erosion regime over the past 2,000 y in the Siskiyou Mountains, Oregon, Proceedings of the National Academy of Sciences, 107, 18909-18914. doi: https://dx.doi.org/10.1073/pnas.1007692107


- Dubois, N, M Kienast, S Kienast, SE Calvert, R Francois, and RF Anderson (2010) Sedimentary opal records in the eastern equatorial Pacific:  It is not all about leakage, Global Biogeochemical Cycles, 24, GB4020. doi: https://dx.doi.org/10.1029/2010GB003821


- Kneafsey, T, E Rees (2010) X-ray CT observations of methane hydrate distribution changes over time in a natural sediment core from the BPX-DOE-USGS Mount Elbert Gas Hydrate Stratigraphic Test Well, Lawrence Berkeley National Laboratory Publication,


- Kusch, S, TI Eglinton, AC Mix, G Mollenhauer (2010) Timescales of lateral sediment transport in the Panama Basin as revealed by radiocarbon ages of alkenones, total organic carbon and foraminifera, Earth and Planetary Science Letters, 290, 340-350. doi: https://dx.doi.org/10.1016/j.epsl.2009.12.030


- Lopes, C, AC Mix, F Abrantes (2010) Environmental controls of diatom species in northeast Pacific sediments, Palaeogeography, Palaeoclimatology, Palaeoecology, 297, 188-200. doi: https://dx.doi.org/10.1016/j.palaeo.2010.07.029


- Prahl, FG, JF Rontani, N Zabeti, SE Walinsky, and MA Sparrow (2010) Systematic pattern in UK’37–Temperature residuals for surface sediments from high latitude and other oceanographic settings, Geochimica et Cosmochimica Acta, 74, 131-143. doi: https://dx.doi.org/10.1016/j.gca.2009.09.027


- Rose, Kathryn A, E Sikes, T Guilderson, P Shane, T Hill, R Zahn, H Spero (2010) Upper-ocean-to-atmosphere radiocarbon offsets imply fast deglacial carbon dioxide release, Nature, 466, 1093-1097. doi: https://dx.doi.org/10.1038/nature09288
`}</SemanticMDX>
	);
};

const Publications2000to2009: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
The OSU-MGR has a long history of assisting with scientific research resulting in over 400 scientific publications. These are also listed  in a [Google Scholar Citation](https://scholar.google.com/citations?hl=en&user=x5lYe50AAAAJ&view_op=list_works) page. If you use our cores and publish the data on them then please drop us an email to keep this page updated!

- Addison, Jason A (2009) High-Resolution Paleoceanography of the Gulf of Alaska, Subarctic Northeast Pacific Ocean, since the last Glacial Maximum:  Insights into a dynamic atmosphere-ocean-ecosystem linkage at decadal to millennial timescales, PhD thesis, University of Alaska, Fairbanks, 248pp.


- Barron, JA, D Bukry, WE Dean, JA Addison, and B Finney (2009) Paleoceanography of the Gulf of Alaska during the past 15,000 years:  Results from diatoms, silicoflagellates, and geochemistry, Marine Micropaleontology, 72, 176-185. doi: https://dx.doi.org/10.1016/j.marmicro.2009.04.006


- Dubois, N, Kienast, M, Normandeau, C, Herbert, TD (2009) Eastern equatorial Pacific cold tongue during the Last Glacial Maximum as seen from alkenone paleothermometry, Paleoceanography, 24, PA4207. doi: https://dx.doi.org/10.1029/2009PA001781


- Gavin, Daniel, F Hu, I Walker, K Westover (2009) The Northern Inland Temperate Rainforest of British Columbia: Old Forests With a Young History?, Northwest Science, 83, 70.


- Hsieh, Chih-Ting (2009) Deconvolving the Sedimentary Phases of Barium Using Flow-Through Time-Resolved Analysis, MS Thesis, Oregon State University, 84pp.


- Klinkhammer, GP, AC Mix, BA Haley  (2009) Increased dissolved terrestrial input to the coastal ocean during the last deglaciation, Geochemistry Geophysics Geosystems, 10, Q03009. doi: https://dx.doi.org/10.1029/2008G002219


- Lopes, Christina, and AC Mix (2009) Pleistocene megafloods in the northeast Pacific, Geology, 37, 79-82. doi: https://dx.doi.org/10.1130/G25025A.1


- Saikku, Reeta, L Stott, R Thunell (2009) A bi-polar signal recorded in the western tropical Pacific: Northern and Southern Hemisphere climate records from the Pacific warm pool during the last Ice Age, Quaternary Science Reviews, 28, 2374-2385. doi: https://dx.doi.org/10.1016/j.quascirev.2009.05.007


- Ullrich, AD, EA Cowan, SD Zellars, JM Jaeger, and RD Powell (2009) Intra-annual Variability in Benthic Foraminiferal Abundance in Sediments of Disenchantment Bay, an Alaskan Fjord, Arctic, Antarctic, and Alpine Research, 41, 257-271. doi: https://dx.doi.org/10.1657/1938-4246-41.2.257


- Waddell, L, IL Hendy, TC Moore, MW Lyle (2009) Ventilation of the abyssal Southern Ocean during the late Neogene: A new perspective from the subantarctic Pacific, Paleoceanography, 24, PA3206. doi: https://dx.doi.org/10.1029/2008PA001661


- Waddell, L, IL Hendy, TC Moore, MW Lyle (2009) Subantarctic Pacific stable isotope evidence for a CO2 sink in the abyssal Southern Ocean during the late Pliocene, Goldschmidt Conference Abstracts 2009, A1398.


- Waddell, Lindsey (2009) Cenozoic High Latitude Paleoceanography: New Perspectives from the Arctic and Subantarctic Pacific, pHd Thesis, University of Michigan, Ann Arbor, 157pp.


- Walinsky, SE, FG Prahl, AC Mix, BP Finney, JM Jaeger and GP Rosen (2009) Distribution and composition of organic matter in surfae sediments of coastal Southeast Alaska, Continental Shelf Research, 29, 1565-1579. doi: https://dx.doi.org/10.1016/j.csr.2009.04.006


- Agnihotri, Rajesh, MA Altabet, TD Herbert, and JE Tierney (2008) Subdecadally resolved paleoceanography of the Peru margin during the lst two millennia, Geochemistry Geophysics Geosystems, 9, Q05013. doi: https://dx.doi.org/10.1029/2007GC001744


- Anderson, BJ, J Wilder, M Kurihara, M White, G Moridis, S Wilson, etal (2008) Analysis of modular dynamic formation test results from the Mount Elbert -01 stratigraphic test well, Milne Point Unit, North Slope, Alaska, Proceedings of the 6th International Conference on Gas Hydrates (ICGH 2008), Vancouver, British Columbia, Canada, July 6-10, 2008,


- Boswell, R, R Hunter, T Collett, S Digert, S Hancock, M Weeks (2008) Investigation of gas hydrate-bearing sandstone reservoirs at the “Mount Elbert” stratigraphic test well, Milne Point, Alaska , Proceedings of the 6th International Conference on Gas Hydrates (ICGH 2008), Vancouver, British Columbia, Canada, July 6-10, 2008,


- Chase, Marianne, C Bleskie, I Walker, D Gavin, F Hu (2008) Midge-inferred Holocene summer temperatures in Southeastern British Columbia, Canada, Palaeogeography, Palaeoclimatology, Palaeoecology, 257, 244-259. doi: https://dx.doi.org/10.1016/j.palaeo.2007.10.020


- Goldfinger, C, K Grijalva, R Burgmann, AE Morey, JE Johnson, CH Nelson, J Gutierrez-Pastor, A Ericsson, E Karabanov, JD Chaytor, J Patton, E Gracia  (2008) Late Holocene Rupture of the Northern San Andreas Fault and Possible Stress Linkage to the Cascadia Subduction Zone, Bulletin of the Seismological Society of America, 98, 861-889. doi: https://dx.doi.org/10.1785/0120060411


- Griffith, EM, EA Schauble, TD Bullen, A Paytan (2008) Characterization of calcium isotopes in natural and synthetic barite, Geochimica et Cosmochimica Acta, 72, 5641-5658. doi: https://dx.doi.org/10.1016/j.gca.2008.08.010


- Hale, Sarah Beth (2008) Paleoproductivity Variations in the Eastern Central Equatorial Pacific Ocean on Glacial Timescales, MS Thesis, Indiana University, 164pp.


- Kienast, M, MF Lehmann, A Timmermann, E Galbraith, T Bolliet, A Holboum, C Normandeau, and C Laj (2008) A mid-Holocene transition in the nitrogen dyanamics of the western equatorial Pacific: Evidence of a deepening thermocline?, Geophysical Research Letters, 35, L23610. doi: https://dx.doi.org/10.1029/2008GL035464


- Kurihara, M, Y Masuda, K Yamamoto, H Narita, S Dallimore, T Collett, S Hancock (2008) Analyses of production tests and MDT tests conducted in Mallik and Alaska methane hydrate reservoirs: what can we learn from these well tests?, Proceedings of the 6th International Conference on Gas Hydrates (ICGH 2008), Vancouver, British Columbia, Canada, July 6-10, 2008,


- Kusch, S, TI Eglinton, A Mix, G Mollenhauer (2008) Compound-specific radiocarbon ages of alkenones reveal rapid bottom current induced lateral sediment transport in the Panama Basin, Gordon Research Conference Organic Geochemistry, Holderness, NH, USA, August 3-8, 2008,


- Lorenson, T, T Collett, R Hunter (2008) Preliminary assessment of hydrocarbon gas source from the Mt. Elbert No. 1 gas hydrate test well, Milne Point Alaska, Proceedings of the 6th International Conference on Gas Hydrates (ICGH 2008), Vancouver, British Columbia, Canada, July 6-10, 2008, Lor08,


- McKay, JL, TF Pedersen (2008) The accumulation of silver in marine sediments: A link to biogenic Ba and marine productivity, Global Biogeochemical Cycles, 22, GB4010. doi: https://dx.doi.org/10.1029/2007GB003136


- McQuay, EL, ME Torres, RW Collier, CA Huh, J McManus (2008) Contribution of Cold Seep Barite to the Barium Geochemical Budget of a Marginal Basin, Deep-Sea Research I, 55, 801-811. doi: https://dx.doi.org/10.1016/j/dsr.2008.03.001


- Stancin, AM, JD Gleason, RM Owen, DK Rea, JD Blum (2008) Piston core record of Late Paleogene (31Ma) to recent seafloor hydrothermal activity in the Southwest Pacific Basin, Paleoceanography, 23, PA1212. doi: https://dx.doi.org/10.1029/2006PA001406


- Stancin, AM, JD Gleason, SA Hovan, DK Rea, RM Owen, TC Moore Jr, CM Hall, JD Blum (2008) Miocene to recent eolian dust record from the Southwest Pacific ocean at 40° S latitude, Palaeogeography, Palaeoclimatology, Palaeoecology, 261, 218-233. doi: https://dx.doi.org/10.1016/j.palaeo.2007.12.015


- Wilder, JW, G Moridis, S Wilson, M Kurihara, M White, Y Masuda, B Anderson, T Collett, R Hunter, H Narita, M Pooladi-Darvish, K Rose, R Boswell  (2008) An international effort to compare gas hydrate reservoir stimulators, Proceedings of the 6th International Conference on Gas Hydrates (ICGH 2008), Vancouver, British Columbia, Canada, July 6-10, 2008,


- Abrantes, F, C Lopes, A Mix, N Pisias (2007) Diatoms in the Southesat Pacific surface sediments reflect environmental properties, Quaternary Science Reviews, 26, 155-169. doi: https://dx.doi.org/10.1016/j.quascirev.2006.02.022


- Altabet, Mark A (2007) Constraints on oceanic N balance/imbalance from sedimentary 15N records, Biogeosciences, 4, 75-86.


- Barron, JohnA and David Bukry (2007) Development of the California Current during the past 12,000 yr based on diatoms and silicoflagellates, Palaeogeography, Palaeoclimatology, Palaeoecology, 248, 313-338. doi: https://dx.doi.org/10.1016/j.palaeo.2006.12.009


- Goldfinger, C, AE Morey, CH Nelson, J Gutierrez-Pastor, JE Johnson, E Karabanov, J Chaytor, A Eriksson, Shipboard Scientific Party (2007) Rupture lengths and temporal history of significant earthquakes on the offshore and north coast segments of the Northern San Andreas Fault based on turbidite stratigraphy, Earth and Planetary Science Letters, 24, 41909.


- Kienast, SS, M Kienast, AC Mix, SE Calvert, and R Francois (2007) Thorium-230 normalized particle flux and sediment focusing in the Panama Basin region during the last 30,000 years, Paleoceanography, 22, PA2213. doi: https://dx.doi.org/10.1029/2006PA001357


- Lyle, M, N Pisias, A Paytan, JI Martinez and A Mix  (2007) Reply to comment by R. Francois et al. on “Do geochemical estimates of sediment focusing in the equatorial Pacific pass the sediment test in the equatorial Pacific?”:Further explorations of 230Th normalization  , Paleoceanography, 22, PA1217. doi: https://dx.doi.org/10.1029/2006PA001373


- Lyle, M, S Gibbs, TC Moore and DK Rea (2007) Late Oligocene initiation of the Antarctic Circumpolar Current:  Evidence from the South Pacific, Geology, 35, 691-694. doi: https://dx.doi.org/10.1130/G23806A.1


- Paytan, A, EM Griffith (2007) Marine barite: Recorder of variations in ocean export productivity, Deep-Sea Research II, 54, 687-705. doi: https://dx.doi.org/10.1016/j.dsr2.2007.01.007


- Stott, L, A Timmermann and R Thunell (2007) Southern Hemisphere and Deep-Sea Warming Led Deglacial Atmospheric CO2 Rise and Tropical Warming, Science, 318, 435. doi: https://dx.doi.org/10.1126/science.1143791


- Stott, Lowell (2007) Comment on “Anomalous radiocarbon ages for foraminifera shells” by W. Broeker et al.: A correction to the western tropical Pacific MD9821-81 record, Paleoceanography, 22, PA1211. doi: https://dx.doi.org/10.1029/2006PA001379


- VanLaningham, Sam (2007) The Fluvial Response to Glacial-Interglacial Climate Change in the Pacific NOrthwest, USA, pHd thesis, Oregon State University, 197pp.


- Agnihotri, Rajesh, MA Altabet, and TD Herbert (2006) Influence of marine denitrification on atmospheric N2O variability during the Holocene, Geophysical Research Letters, 33, L13704. doi: https://dx.doi.org/10.1029/2006GL025864


- Gonneea, ME, A Paytan (2006) Phase associations of barium in marine sediments, Marine Chemistry, 100, 124-135. doi: https://dx.doi.org/10.1016/j.marchem.2005.12.003


- Hopkins, S, J Kennett, C Nicholson, D Pak, C Sorlien,  R Behl, W Normark, R Sliter, T Hill, A Schimmelmann, and K Cannariato (2006) Santa Barbara Basin Study Extends Global Climate Record, EOS, 87(21), 205.


- Kienast, M, SS Kienast, SE Calvert, TI Eglinton, G Mollenhauer, R Francois, AC Mix (2006) Eastern Pacific cooling and Atlantic overturning circulation during the last deglaciation, Nature, 443, 846-849. doi: https://dx.doi.org/10.1038/Nature05222


- Kienast, SS, M Kienast, S, Jaccard, SE Calvert, and R Francois (2006) Testing the silica leakage hypothesis with sedimentary opal records from the eastern equatorial Pacific over the last 150 kyrs , Geophysical Research Letters, 33, L15607. doi: https://dx.doi.org/10.1029/2006GL026651


- Lopes, Christina Isabel Coelho Dias Lopes (2006) Late Quaternary Paleoceanography of the Northeast Pacific and Atlantic Oceans Based on Diatom Transfer Functions, pHd thesis, Oregon State University, 252pp.


- Lopes, Christina, AC Mix and Fatima Abrantes (2006) Diatoms in northeast Pacific surface sediments as paleoceanographic proxies, Marine Micropaleontology, 60, 45-65. doi: https://dx.doi.org/10.1016/j.marmicro.2006.02.0106


- McQuay, Erica (2006) Contribution of Cold Seep Barite to the Barium Geochemical Budget of a Marginal Basin, Ms Thesis, Oregon State University, 142pp.


- Newton, Alicia, Robert Thunell and Lowell Stott (2006) Climate and hydrographic variability in the Indo_Pacific warm Pool during the last millennium, Geophysical Research Letters, 33, L19710. doi: https://dx.doi.org/10.1029/2006GL027234


- Prahl, FG, AC Mix, and MA Sparrow (2006) Alkenone paleothermometry:  Biological lessons from marine sediment records off western South America, Geochimica et Cosmochimica Acta, 70, 101-117.


- Prahl, FG, JF Rontani, JK Volkman, MA Sparrow, and IM Royer (2006) Unusual C35 and C36 alkenones in a paleoceanographic benchmark strain of Emiliania huxleyi, Geochimica et Cosmochimica Acta, 70, 2856-2867. doi: https://dx.doi.org/10.1016/j.gca.2006.03.009


- Prokopenko, MG, DE Hammond, WM Berelson, JM Bernhard, L Stott, & R Douglas (2006) Nitrogen cycling in the sediments of Santa Barbara basin and Eastern Subtropical North Pacific:  Nitrogen isotopes, diagenesis and possible chemosymbiosis between two lithotrophs (Thioploca and Anammox)–”riding on a glider”, Earth and Planetary Science Letters, 242, 186-204. doi: https://dx.doi.org/10.1016/j.epsl.2005.11.044


- Rea, DK, MW Lyle, LM Liberty, SA Hovan, MP Bolyn, JD Gleason, IL Hendy JC Latimer, BM Murphy, RM Owen, CF Paul, THC Rea, AM Stancin, DJ Thomas  (2006) Broad region of no sediment in the southwest Pacific Basin, Geology, 34 (10), 4pp. doi: https://dx.doi.org/10.1130/G22864.1


- Rontani, Jean-Francois, FG Prahl, and JK Volkman (2006) Re-examination of the double bond positions in alkenones and derivatives: Biosynthetic implications, Journal of Phycology, 42, 800-813.


- Rontani, Jean-Francois, FG Prahl, and JK Volkman (2006) Characterization of unusual alkenones and alkyl alkenoates by electron ionization gas chromatography/mass spectrometry, Rapid Communications in Mass Spectrometry, 20, 583-588. doi: https://dx.doi.org/10.1002/rcm.2346


- Rontani, Jean-Francois, P Bonin, FG Prahl, ID Jameson, and JK Volkman (2006) Experimental and field evidence for thiyl radical-induced stereomutation of alkenones and other lipids in sediments and seawater, Organic Geochemistry, 37, 1489-1504. doi: https://dx.doi.org/10.1016/j.orggeocem.2006.06.021


- Shane, Phil, EL Sikes, TP Guilderson (2006) Tephra beds in deep-sea cores off northern New Zealand:  implications for the history of Taupo Volcanic ZOne, Mayor Island and White Island volcanoes , Journal of Volcanology and Geothermal Research, 154, 276-290. doi: https://dx.doi.org/10.1016/j.jvolgeores.2006.03.021


- Stancin, AM, JD Gleason, DK Rea, RM Owen, TC Moore Jr, JD Blum, SA Hovan (2006) Radiogenic isotopic mapping of late Cenozoic eolian and hemipelagic sediment distribution in the east-central Pacific, Earth and Planetary Science Letters, 248, 840-850. doi: https://dx.doi.org/10.1016/j.epsl.2006.06.038


- Benway, Heather M (2005) Modern and Past Climate Variability in the Eastern Pacific Warm Pool, pHd Thesis, Oregon State University, 90 pp.


- Lyle, M, N Mitchell, N Pisias, A Mix, JI Martinez, A Paytan (2005) Do geochemical estimates of sediment focusing in the equatorial Pacific pass the sediment test in the equatorial Pacific?  , Paleoceanography, 20, PA1005. doi: https://dx.doi.org/10.1029/2004PA001019


- Silver, E, S Day, S Ward, G Hoffmann, P Lianes, A Lyons, N Driscoll, R Perembo, S John, S Saunders, F Taranu, L Anton, I Abiari, B Applegate, J Engles, J Smith, J Tagliodes (2005) Island Arc Debris Avalanches and Tsunami Generation, EOS, 86, 485.


- Wheat, C Geoffrey and James McManus (2005) The potential role of ridge-flank hydrothermal systems on oceanic germanium and silicon balances, Geochimica et Cosmochimica Acta, 69, 2021-2029. doi: https://dx.doi.org/10.1016/j.gca.2004.05.046


- Broecker, W, S Barker, E Clark, I Hajdas, G Bonani & L Stott (2004) Ventilation of the Glacial Deep Pacific Ocean, Science, 306, 1169-1172.


- Clark, PU, AM McCabe, AC Mix, AJ Weaver (2004) Rapid Rise of Sea Level 19,000 years ago and its global implications, Science, 304, 1141-1144.


- Gleason, JD, TC Moore, TM Johnson, DK Rea, RM Owen, JD Blum, J Pares, SA Hovan, (2004) Age calibration of piston core EW9709-07 (equatorial central Pacific) using fish teeth Sr isotope stratigraphy, Palaeogeography, Palaeoclimatology, Palaeoecology, 212, 355-366.


- Higginson, MJ and MA Altabet (2004) Initial test of the silicic acid leakage hypothesis using sedimentary biomarkers, Geophysical Research Letters, 31, L18303. doi: https://dx.doi.org/10.1029/2004GL020511


- Johnson, Joel E (2004) Deformation, Fluid Venting, and Slope Failure at an Active Margin Gas Hydrate Province, Hydrate Ridge Cascadia Accretionalry Wedge, pHd thesis, Oregon State University, 145pp.


- Kish, Stacy W (2004) Changing Export Production in the Eastern Equatorial Pacific, 160 ka to Present, MS Thesis, Oregon State University, 167pp.


- Klinkhammer, GP, BA Haley, AC Mix, HM Benway, and M Cheseby (2004) Evaluation of automated flow-through time-resolved analysis of foraminifera for Mg/Ca paleothermometry, Paleoceanography, 19, PA4030. doi: https://dx.doi.org/10.1029/2004PA001050


- Loubere, Paul, Figen Mekik, Roger Francois, and Sylvain Pichat (2004) Export fluxes of calcite in the eastern equatorial Pacific from the last Glacial Maximum to present, Paleoceanography, 19, PA2018.


- Paytan, A, M Lyle, AC Mix, Z Chase (2004) Climatically Driven Changes in Oceanic Processes Throughout the Equatorial Pacific, Paleoceanography, 19, PA4017. doi: https://dx.doi.org/10.1029/2004PA001024.


- RC Dugdale, M Lyle, FP Wilkerson, R Chai, RT Barber, and TH Peng (2004) Influence of equatorial diatom processes on Si deposition and atmospheric CO2 cycles at glacial/interglacial timescales, Paleoceanography, 19, 10pgs. doi: https://dx.doi.org/10.1029/2003PA000929


- Stott, LD, K Cannariato, R Thunell, GH Haug, A Koutavas & S Lund (2004) Decline of surface temperature and salinity in the western tropical Pacific Ocean in the Holocene epoch, Nature, 431, 56-59. doi: https://dx.doi.org/10.1038/nature02903


- Visser, Katherine, Robert Thunell, and Miguel A Goni (2004) Glacial-interglacial organic carbon record from the Makassar Strait, Indonesia: implications for regiona changes in continental vegetation, Quaternary Science Reviews, 23, 17-27.


- Barron, JA, D Bukry and JL Bischoff  (2003) A 2000-yr-long record of climate from the Gulf of Clifornia, In West, G.J. and L.D. Buffaloe, eds. Proceedings of the 19th Pacific Climate Workshop (Asilomar, Pacific Grove, CA) March 3-6, 2002, Technical Report 71 of the Interagency Ecological Program for the San Francisco Estuary, 41964.


- Barron, JA, L Heusser, T Herbert, and M Lyle (2003) High-resolution climatic evolution of coastal northern Califormia during the past 16,000 years, Paleoceanography, 18, 24pp. doi: https://dx.doi.org/10.1029/2002PA000768


- Benway, HM, BA Haley, GP Klinkhammer, and AC Mix  (2003) Adaptation of a Flow-Through Leaching Procedure for Mg/Ca Paleothermometry, Geochemistry Geophysics Geosystems, 4, 41654. doi: https://dx.doi.org/10.1029/2002GC000312


- Berelson, William M and Lowell D Stott (2003) Productivity and Organic Carbon Rain to the California Margin Sea Floor:  Modern and Paleoceanographic Perspectives., Paleoceanography, 18, 1002. doi: https://dx.doi.org/10.1029/2001PA000672


- Feldberg, M, and AC Mix  (2003) Planktonic foraminifera, sea-surface temperatures, and mechanisms of oceanic change in the Peru and South Equatorial Currents, 0-150 ka BP, Paleoceanography, 18/1, 41655. doi: https://dx.doi.org/10.1029/2001PA000740


- Goldfinger, C, CH Nelson, JE Johnson, Shipboard Scientific Party (2003) Deep-water turbidites as Holocene earthquake proxies: the Cascadia subduction zone and Northern San Andreas Fault systems, Annals of Geophysics, 46, 1169-1194.


- Goldfinger, C, CH Nelson, JE Johnson, Shipboard Scientific Party (2003) Holocene Easthquake Records from the Cascadia Subduction Zone and Northern San Andreas Fault Based on Precise Dating of Offshore Turbidites, Annual Review Earth Planetary Science, 31, 555-577. doi: https://dx.doi.org/10.1146/annurev.earth.31.100901.141246


- Loubere, Paul, M Fariduddin, and RW Murray (2003) Patterns of export production in the eastern equatorial Pacific over the past 130,000 years, Paleoceanography, 18 (2), 6.1-6.21. doi: https://dx.doi.org/10.1029/2001PA000658


- Mix, AC, B Conard, J Broda, S Carey, J Firth, T Janecek, R Lotti-Bond, C Moore, R Norris, D Schnurrenberger (2003) Curators of Sea Floor and Lakebed Samples Celebrate 25 Years of Service. , EOS, 84 (20), 191.


- Torres, ME, AC Mix, KKinports, B Haley, GP Klinkhammer, J McManus, and MA deAngelis (2003) Is methane venting at the seafloor recorded by ?13C of benthic foraminifera shells?, Paleoceanography, 18 (3), 1062.


- Visser, Katherine, Robert Thunell, and Lowell Stott (2003) Magnitude and timing of temperature change in the Indo-Pacific warm pool during deglaciation, Nature, 421, 152-155.


- Ager, Thomas A  (2002) Paleoenvironments of the Bering Land Bridge and the North Pacific Coast During the Late Wisconsin and Early Holocene, 17th Annual Meeting of the American Quaternary Association (Anchorage, USA) August, 2002,


- Feldberg, Melissa J and Alan C Mix (2002) Sea surface temperature estimates in the Southeast Pacific Based on Planktonic Foraminiferal Species;  Modern Calibration and Last Glacial Maximum, Marine Micropaleontology, 44, 41668.


- Gleason, JD, TC Moore, DK Rea, TM Johnson, RM Owen, JD Blum, SA Hovan, and CE Jones (2002) Ichthyolith strontium isotope stratigraphy of a Neogene red clay sequence: Calibrating eolian dust accumulation rates in the central North Pacific. , Earth and Planetary Science Letters, 202, 625-636.


- Guay, CKH and JKB Bishop (2002) A Rapid Birefringence Method for Measuring Suspended CaCO3 Concentrations in Seawater, Deep-Sea Research I, 49, 197-210.


- Keller, RA, MR Fisk, JL Smellie, JA Strelin, LA Lawver (2002) Geochemistry of back arc basin volcanism in Bransfield Strait, Antarctica: Subducted contributions and along-axis variations, Journal of Geophysical Research, 107, 17pp. doi: https://dx.doi.org/10.1029/2001JB000444


- Lyle, M, AC Mix, NG Pisias  (2002) Patterns of CaCO3 deposition in the eastern tropical Pacific Ocean for the last 150 kyr:  Evidence for a southeast Pacific depositional spike during marine isotope stage (MIS) 2, Paleoceanography, 17 (2), 13pp. doi: https://dx.doi.org/10.1029/2000PA000538


- Lyle, M, Lee Liberty, TC Moore Jr, DK Rea (2002) Development of a Seismic Stratigraphy for the Paleogene Sedimentary Section, Central Tropical Pacific Ocean, in Preceedings of the Ocean Drilling Program, Initial Reports Volume 199.  M. Lyle, P.A. Wilson, T.R. Janecek, eds., 199, 20pp.


- Mahoney, JJ, DW Graham, DM Christie, KTM Johnson, LS Hall, and DL VonderHaar (2002) Between a Hotspot and a Cold Spot:  Isotopic Variation in the Southeast Indian Ridge Asthenosphere, 86°E-118°E., Journal of Petrology, 43 (7), 1155-1176.


- McManus, J, J Dymond, RB Dunbar, and RW Collier (2002) Particulate barium fluxes in the Ross Sea. , Marine Geology, 184, 41654.


- Mekik, Figen, Paul W Loubere, and David E Archer  (2002) Organic carbon flux and organic carbon to calcite flux ratio recorded in deep-sea carbonates:  Demonstration and a new proxy, Global Biogeochemical Cycles, 16, 15pp. doi: https://dx.doi.org/10.1029/2001GB001634


- Potter, Susan (2002) The Gorda Escarpment’s Rise and Fall:  A Synthesis of Exploration Seismology, Sampling Efforts, Micropaleontology, and Radiometric Dating, MS thesis, Oregon State University, 107pp.


- Rehkämper, M, M Frank, JR Hein, D Porcelli, A Halliday, J Ingri, & V Liebetrau (2002) Thallium isotope variations in seawater and hydrogenetic, diagenetic, and hydrothermal ferromanganese deposits, Earth and Planetary Science Letters, 197, 65-81.


- Stott, L, C Poulsen, S Lund, R Thunell (2002) Super ENSO and Global Climate Oscillations at Millennial Time Scales, Science, 297, 222-226.


- Stott, LD, T Bunn, M Prokopenko, C Mahn, J Gieskes, JM Bernhard (2002) Does the Oxidation of Methane Leave an Isotopic Fingerprint in the Geologic Record? , Geochemistry Geophysics Geosystems, 3, 16pp. doi: https://dx.doi.org/10.1029/2001GC000196


- Torres, ME, J McManus, D Hammond, MA de Angelis, K Hescheen, SL Colbert, MD Tryon, KM Brown, and E Suess (2002) Fluid and chemical fluxes in and out of sediments hosting methane hydrate deposits on Hydrate Ridge, OR.  I. Hydrological provinces, Earth and Planetary Science Letters, 201, 525-540.


- Altabet, Mark A and R Francois (2001) Nitrogen isotope biogeochemistry of the Antarctic Polar Frontal Zone at 170°W, Deep-Sea Research II, 48, 4247-4273.


- Beaufort, L, T Garidel-Thoron, AC Mix, and NG Pisias (2001) ENSO-like forcing on oceanic primary production during the late Pleistocene, Science, 293, 2440-2444.


- Feldberg, Melissa J (2001) Late Pleistocene Changes in the Peru Current Based on Planktonic Foraminifera, MS thesis, Oregon State University, 110pp.


- Graham, DW, JE Lupton, FJ Spera, and DM Christie (2001) Upper-mantle Dynamics Revealed by Helium Isotope Variations Along the Southeast Indian Ridge, Nature, 409, 701-703.


- Herbert, TD, JD Schuffert, D Andreassen, L Heusser, M Lyle, A Mix, AC Ravelo, LD Stott, and JC Herguera (2001) Collapse of the California Current during glacial maxima linked to climate change on land, Science, 293, 71-76.


- Marcantonio, F, RF Anderson, S HIggins, M Stute, P Schlosser, and P Kubik (2001) Sediment focusing in the central equatorial Pacific Ocean, Paleoceanography, 16 (3), 260-267.


- Pisias, NG, AC Mix, and L Heusser (2001) Millennial scale climate variability of the Northeast Pacific Ocean and Northwest North America based on Radiolaria and Pollen, Quaternary Science Reviews, 20, 1561-1576.


- Radi, Taofik, Anne DeVernal and Odile Peyron (2001) Relationships between dinoflagellate cyst assemblages in surface sediment and hydrographic conditions in the Bering and Chukchi seas, Journal of Quaternary Science, 16 (7), 667-680.


- Shen, CC, DW Hastings, T Lee, CH Chiu, MY Lee, KY Wei, and RL Edwards (2001) High precision glacial-interglacial benthic foraminiferal Sr/Ca records from the eastern equatorial Atlantic Ocean and Caribbean Sea., Earth and Planetary Science Letters, 190, 197-209.


- Collier, RW, J Dymond, S Honjo, S Manganini, R Francois, R Dunbar (2000) The vertical flux of biogenic and lithogenic material in the Ross Sea:  moored sediment trap observations 1996-1998, Deep-Sea Research II, 47, 3491-3520.


- Heusser, LE, M Lyle, A Mix  (2000) Vegetation and climate of the northwest coast of North America during the last 500 k.y.: High-resolution pollen evidence from the northern California Margin, In Proceedings of the Ocean Drilling Program, Scientific Results. Lyle, M., Koizumi, I., Richter, C. and Moore, T.C. (eds.) Ocean Drilling Program, College Station, TX, 167, 217-226.


- Loubere, Paul (2000) Marine control of biological production in the eastern equatorial Pacific Ocean, Nature, 406, 497-500.


- Lyle, M, A Mix, C Ravelo, D Andreasen, H Heusser, A Olivarez (2000) Millennial scale CaCO3 and Corg events along the northern and central California Margin: Stratigraphy and origins, In Proceedings of the Ocean Drilling Program, Scientific Results. Lyle, M., Koizumi, I., Richter, C. and Moore, T.C. (eds.) Ocean Drilling Program, College Station, TX, 167, 163-182.


- Schaller, Tobias, Jennifer Morford, Steven R Emerson, and Richard A Feely (2000) Oxyanions in metalliferous sediments:  Tracers for paleoseawater metal concentrations?, Geochimica et Cosmochimica Acta, 63, 2243-2254.


- Stoll, Heather M and Daniel P Schrag (2000) Coccolith Sr/Ca as a new indicator of coccolithophorid calcification and growth rate, Geochemistry Geophysics Geosystems, 1,


- Stott, LD, M Neumann, D Hammond (2000) Intermediate water ventilation on the northeastern Pacific margin during the late Pleistocene inferred from benthic foraminiferal deltaC13, Paleoceanography, 15, 161-169. 1999PA000375


- Torres, ME, J McManus and C Goldfinger (2000) Mapping, geochemical sampling and submersible observations of recent activity on the San Clemente Fault zoneOregon State University Data report 180, Oregon State University Data report 180, 00-4, 26pp.


- Viscosi-Shirley, Carolyn (2000) Siberian-Arctic Shelf Surface-Sediments:  Sources, Transport Pathways and Processes, and Diagenetic Alteration, pHd Thesis, Oregon State University, 178pp.


- Wright, DJ, S Bloomer, C MacLeod, B Taylor and , A Goodlife (2000) Bathymetry of the Tonga Trench and Forearc: a map series, Marine Geophysical Researches, 21, 489-511.
`}</SemanticMDX>
	);
};

const Publications1990to1999: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
The OSU-MGR has a long history of assisting with scientific research resulting in over 400 scientific publications. These are also listed  in a [Google Scholar Citation](https://scholar.google.com/citations?hl=en&user=x5lYe50AAAAJ&view_op=list_works) page. If you use our cores and publish the data on them then please drop us an email to keep this page updated!

- Dowsett, Harry J and Richard Z Poore (1999) Last Interglacial Sea-Surface Temperature Estimates from the California Margin:  Improvements to the Modern Analog Technique, U.S. Geological Survey Bulletin 2171, available only at http://pubs.usgs.gov/bulletin/b2171/, 41645.


- Loubere, Paul (1999) A multiproxy reconstruction of biological productivity and oceanography in the eastern equatorial Pacific for the past 30,000 years , Marine Micropaleontology, 37, 173-198.


- Loubere, Paul and Fariduddin, Mohammad (1999) Quantitative estimation of global patterns of surface ocean biological productivity and its seasonal variation on timescales from centuries to millennia, Global Biogeochemical Cycles, 13, 115-133.


- Mix, AC , AE Morey, NG Pisias, and SWHostetler (1999) Foraminiferal faunal estimates of paleotemperature:  Circumventing the no-analog problem yields cool ice age tropics, Paleoceanography, 14, 350-359.


- Mix, AC, AE Morey, and NG Pisias (1999) Foraminiferal faunal estimates of paleotemperature: Circumventing the no-analog problem yields cool ice age tropics, Paleoceanography, 14, 350-359.


- Mix, AC, DC Lund, NG Pisias, P Boden, L Bornmalm, M Lyle, and J Pike (1999) Rapid Climate Oscillations in the Northeast Pacific During the Last Deglaciation Reflect Northern and Southern Hemisphere Sources, in Mechanisms of Global Climate Change at Millennial Time Scales, Geophysical Monograph 112, American Geophysical Union, 127-147.


- Morford, JL (1999) The Geochemistry of Redox-Sensitive Trace Metals. , pHd thesis, University of Washington, 239pp.


- Christie, David M, Brian P West, Douglas G Pyle, and Barry B Hanan (1998) Chaotic topography, mantle flow and mantle migration in the Australian-Antarctic discordance, Nature, 394, 637-644.


- Darby, Dennis (1998) Mysterious iron-nickel-zinc arctic spherules, Candian Journal of Earth Sciences, 35, 23-29.


- Heusser, Linda (1998) Direct correlation of millennial-scale  changes in western North American vegetation and climate with changes in the California Current system over the past ~60 kyr, Paleoceanography, 13, 252-262.


- Joseph, LH, DK Rea, and BA van der Pluijm (1998) Use of grain size and magnetic fabric analyses to distinguish among depositional environments, Paleoceanography, 13, 491-501.


- Loubere, Paul (1998) The impact of seasonality on the benthos as reflected in the assemblages of deep-sea foraminifera, Deep-Sea Research, 45, 409-432.


- Lund, David C (1998) Millennial-Scale Surface and Deep Water Oscillationsin the N.E. Pacific:  Implications for Late Pleistocene Climate Change, MS thesis, Oregon State University, 75pp.


- Lund, David C and Alan C Mix (1998) Millennial-Scale Deep Water Oscillations:  Reflections of the North Atlantic in the Deep Pacific from 10 to 60 ka, Paleoceanography, 13, 41931.


- McManus, J, WM Berelson, GP Klinkhammer, KS Johnson, KH Coale, DC McCorkle, DJ Burdige, DE Hammond, H Brumsack, and A Rushdi (1998) Geochemistry of barium in marine sediments: Implications for its use as a paleoceanographic proxy, Geochimica et Cosmochimica Acta, 62, 3453-3473.


- Nelson, AR, HM Kelsey, E Hemphill-Haley, and RC Witter (1998) AMS 14C dating of a 7300-year earthquake history from an Oregon coastal lake, Geological Society of America, Abstracts with Programs, 30, 162.


- Watkins, James M and Alan C Mix (1998) Testing the effects of tropical temperature, productivity, and mixed-layer depth on foraminiferal transfer functions, Paleoceanography, 13, 96-105.


- Wheat, CG, J McManus, J Dymond, RW Collier, and M Witicar  (1998) Hydrothermal fluid circulation through the sediment of Crater Lake, Oregon:  Pore water and heat flow data, Journal of Geophysical Research, B5:103, 9931-9944.


- Bischof, JF  and Darby, DA (1997) Mid- to Late Pleistocene Ice Drift in the Western Arctic Ocean:  Evidence for a Different Circulation in the Past, Science, 277, 74-78.


- Doose, Heidi, Prahl, FG, and Lyle, MW (1997) Biomarker temperature estimates for modern and last glacial surface waters of the California Current system between 33° and 42°N, Paleoceanography, 12, 615-622.


- Dymond, J, RW Collier, J McManus, S Honjo, and S Manganini  (1997) Can the Al/Ti ratio in marine sediments be used as a paleoproductivity proxy?  , Paleoceanography, 12, 586-593.


- Fariduddin, Mohammad and Loubere, Paul (1997) The surface ocean productivity response of deeper water benthic foraminifera in the Atlantic Ocean, Marine Micropaleontology, 32, 289-310.


- Gardner, James V, Walter E Dean, and Peter Dartnell (1997) Biogenic sedimentation beneath the California Current system for the past 30 kyr and its paleoceanographic significance, Paleoceanography, 12, 207-225.


- Nelson, AR, HM Kelsey, E Hemphill-Haley, and RC Witter (1997) A 7200-yr lake record of Cascadia tsunamis in southern coastal Oregon, Abstract for May 1997 meeting of International Geological Correlation Program Project 367 in Anchorage, Alaska, 20.


- Ortiz, JD and AC Mix (1997) Comparison of Imbrie-Kipp transfer function and modern analog temperature estimates using sediment trap and core top foraminiferal faunas, Paleoceanography, 12, 175-190.


- Ortiz, Joseph,  Alan Mix, Steve Hostetler, and Michaele Kashgarian (1997) The California Current of the last glacial maximum:  Reconstruction at 42°N based on multiple proxies, Paleoceanography, 12, 191-205.


- Schroeder, JO, RW Murray, M Leinen, RC Pflaum, and TR Janecek (1997) Barium in equatorial Pacific carbonate sediment: Terrigenous, oxide, and biogenic associations, Paleoceanography, 12, 125-146. doi: https://dx.doi.org/10.1029/96PA0273


- Bischof, J and Darby, D (1996) Changing origin of ice-rafted clastic debris for the Northwind Ridge, western Artic Ocean, during the late Wisconsin-Holocene transition, Proceedings of the Arctic System Science (ARCSS) All-Hands Workshop, Snowbird, Utah,


- Bischof, JF  and Darby, DA (1996) Rapid export of icebergs from the western Arctic Ocean during the past 800 ka recognized as a possible global climate factor, Fall AGU Meeting, EOS, 77(46), F307.


- Dymond, Jack and Robert Collier (1996) Particulate barium fluxes and their relationships to biological productivity, Deep-Sea Research II, 43, 1283-1308.


- Dymond, Jack, Robert Collier and James McManus (1996) Unbalanced particle flux budgets in Crater Lake, Oregon:  Implications for edge effects and sediment focusing in lakes, Limnol. Oceanogr., 41(4), 732-743.


- Jones, CE, AN Halliday, DK Rea, and RM Owen (1996) Eolian transport of natural Pb, Nd, and Sr to the Pacific Ocean, Trans. Am. Geophys. Union (EOS), AGU 1996 Fall Meeting Supplement, 77, F320.


- Joseph, LH, DK Rea, and BA van der Pluijm (1996) Determination of sediment transport processes from grain size and magnetic fabric analysis, Trans. Am. Geophys. Union (EOS), AGU 1996 Spring Meeting Supplement, 77,


- Joseph, LH, DK Rea, and BA van der Pluijm (1996) Paleoceanic variability derived from physical properties of sediment:  Grain-size and magnetic fabric analysis of Bermuda Rise core, Trans. Am. Geophys. Union (EOS), AGU 1996 Fall Meeting Supplement, 77, F288.


- Keller, Randall A (1996) The Petrology, Geochemistry, and Geochronology of Hotspot Seamounts in the North Pacific and Arc/Backarc Volcanism on the Northern Antarctic Peninsula, pHd thesis, Oregon State University, 117pp.


- Kelsey, HM, RC Witter, and E Hemphill-Haley (1996) Record of plate boundary earthquakes near Cape Blanco, south coastal Oregon, Geological Society of America, Abstracts with Programs, Cordilleran Section, 28 (5), 80.


- Loubere, Paul (1996) The surface ocean productivity and bottom water oxygen signals in deep water benthic foraminiferal assemblages, Marine Micropaleontology, 28, 247-261.


- Lund, David (1996) Millennial-Scale Deep Water Oscillations:  Images of the North Atlantic Mirrored in the Deep Pacific, Fall AGU meeting, EOS, 77(46),


- McManus, James, Robert Collier and Jack Dymond (1996) Spatial and temporal distribution of dissolved oxygen in Crater Lake, Oregon, Limnol. Oceanogr., 41(4), 722-731.


- Mix, AC and AE Morey (1996) Climate Feedback and Pleistocene Variations in the Atlantic South Equatorial Current, in The South Atlantic: Present and Past Circulation.  Wefer G, Berger W.H., Siedler G. and Webb, D.J. (eds), Springer-Verlag Berlin Heidelberg, 503-525.


- Murray, RW and M Leinen (1996) Scavenged excess aluminum and its relationship to bulk titanium in biogenic sediment from the central equatorial Pacific Ocean, Geochimica et Cosmochimica Acta, 60, 3869-3878. doi: https://dx.doi.org/10.1016/0016-7037(96)00236-0


- Nelson, AR, Kelsey, HM, Hemphill-Haley, E, and Witter, RC (1996) A 7500-yr Lake Record of Cascadia Tsunamis in Southern Coastal Oregon, Geological Society of America, Abstracts with Programs, Cordilleran Meeting, Portland OR, 28, 95.


- Nelson, CH, Goldfinger, C, Vallier, TL, McGann, ML and Kashgarian, M (1996) North  to South Variation in Cascadia Basin Turbidite Event History:  Implications for Paleoseismicity, GSA Cordilleran Section, Abstracts volume, Portland, OR, April 22-24, 1996,


- Ortiz, Joseph D (1996) Planktic Foraminifers of the California Current at 42°N:  last Glacial Maximum and Present., pHd Thesis, Oregon State University, 219pp.


- Paytan, A, M Kastner, and FP Chavez (1996) Glacial to Interglacial Fluctuations in Productivity in the Equatorial Pacific as Indicated by Marine Barite, Science, 274, 1355-1357.


- Sabin, Ann L and Nicklas G Pisias (1996) Sea Surface Temperature Changes in the Northeasern Pacific Ocean during the Past 20,000 Years and Their Relationship to Climate Change in Northwestern North America, Quaternary Research, 46, 48-61.


- Sinton, CW, DM Christie and RA Duncan (1996) Geochronology of Galapagos seamounts, Journal of Geophysical Research, 101, 13689-13700.


- Watkins, James M (1996) Living Planktic Foraminifera as Environmental Indicators in the Central Equatorial Pacific Ocean, MS thesis, Oregon State University, 142pp.


- Watkins, James M, Alan C Mix and June Wilson (1996) Living planktic foraminifera:  tracers of circulation and productivity regimes in the central equatorial Pacific, Deep-Sea Research, 43, 1257-1282.


- Weber II, ET, RM Owen, GR Dickens, AN Halliday, CE Jones, and DK Rea (1996) Quantitative resolution of eolian continental crustal material and volcanic detritus in North Pacific surface sediment, Paleoceanography, 11, 115-127.


- Witter, RC and HM Kelsey (1996) Repeated abrupt changes in the depositional environment of a freshwater marsh:  a record of late Holocene paleoseismicity at Euchre Creek, south coastal Oregon, Geological Society of America, Abstracts with Programs, Cordilleran Section, 28, 125.


- Chaussidon, Marc and Bernard Marty (1995) Primitive Boron Isotope Composition of the Mantle, Science, 269, 383-386.


- Gardner, James V, Brian D Edwards, Walter E Dean, and June Wilson (1995) P-wave Velocity, Wet Bulk Density, Magnetic Susceptibility, Acoustic Impedance, and Visual Core Descriptions of Sediment Recovered During Research Cruise EW9504:  Data, Techniques, and Procedures, U.S. Department of the Interior; U.S. Geological Survey Open File Report 95-533, 288 pp.


- Gee, Jeff and Dennis V Kent (1995) Magnetic Hysteresis in Young Mid-Ocean Ridge Basalts:  Dominant Cubic Anisotropy?, Geophysical Research Letters, 22, 551-554.


- Halliday, AN, CE Jones, DK Rea, RM Owen, ET Weber, II and GR Dickens  (1995) Isotopic and trace element indicators of provenance of eolian material and paleowind, Goldschmitt conference proceedings,


- Honjo, S, J Dymond, R Collier and SJ Manganini (1995) Export production of particles to the interior of the equatorial Pacific Ocean during the 1992 EqPac experiment, Deep-Sea Research II, 42, 831-870.


- Jasper, JP, EL Sikes, and JM Hayes (1995) Transfer of CO2 from Equatorial Latitudes to High Latitudes During the Late Quaternary, in Air-Water Gas Transfer, Heidelberg, eds. B. Jahne and E. Monahan, Heidelberg:  Aeon-Verlag, 879-888.


- Loubere, Paul (1995) Eastern Equatorial Pacific Record of Surface Ocean Productivity, Upwelling and Bottom Water Oxygen Content., EOS, abstr., 76, 309-310.


- Lyle, Mitchell, Gallaway, PJ, Liberty, LM, Mix, A, Stott, L, Hammond, D, Gardner, J, Dean, W, EW9504 Scientific Party (1995) W9406 and EW9504 Site Surveys of the California Margin Proposed Drilling Sites. Leg 167, Technical Report Boise State University CGISS 95-11, >100pp.


- Moffett, Susan J (1995) A Biostratigraphic Tool for Subdivision of the Brunhes Chron in the Subarctic Northeast Pacific Ocean, MS thesis, University of Southern Mississippi, 90pp.


- Murray, RW, M Leinen, DW Murray, AC Mix, and CW Knowlton (1995) Terrigenous Fe input and biogenic sedimentation in the glacial and interglacial equatorial Pacific Ocean, Global Biogeochemical Cycles, 9, 667-684.


- Nelson, AR, HM Kelsey, E Hemphill-Haley, and RC Witter (1995) A 5,000-year lake record of Cascadia tsunamis in south-coastal Oregon?, Geological Association of Canada/Mineralogical Association of Canada, Final Program and Abstracts, Annual Meeting, May 17-19, Victoria, B.C., 20, A-75.


- Ortiz, JD, AC Mix, and RW Collier (1995) Environmental control of living symbiotic and asymbiotic foraminifera of the California Current, Paleoceanography, 10, 987-1009.


- Prahl, Fredrick G, Nicklas Pisias, Margaret A Sparrow and Anne Sabin (1995) Assessment of sea-surface temperature at 42°N in the California Current over the last 30,000 years, Paleoceanography, 10, 763-773.


- Rea, David K and Steven A Hovan (1995) Grain size distribution and depositional processes of the mineral component of abyssal sediments:  Lessons from the North Pacific, Paleoceanography, 10, 251-258.


- Rea, David K and Steven A Hovan (1995) Grain size distributions and depositional processes of the mineral component of abyssal sediments:  Lessons from the North Pacific, Geophys. Abstr., 5(2), 10.


- Sabin, Ann Louise (1995) Holocene and Latest Pleistocene Paleoceanography of the Northeast Pacific and its Relationship to Climate Change in the Pacific Northwest, MS thesis, Oregon State University, 93pp.


- Snoeckx, Hilde (1995) Late Pleistocene History of Ocean-Atmosphere Interaction in the Eastern Equatorial Pacific, PhD Thesis, University of Michigan, Ann Arbor, 199pp.


- Snoeckx, Hilde and Dave K Rea (1995) Late Pleistocene Interaction between the ocean and atmosphere in the Eastern Equatorial Pacific, 5th Int’l Conf. on Paleoceanography, Halifax, Program and Abstracts, 206.


- Snoeckx, Hilde and Dave K Rea (1995) 45. Data Report:  CaCO3 Content and Bulk Density of Leg 138 Site-survey Piston Cores, in Proceedings of the Ocean Drilling Program, Scientific Results, Pisias N.G., Mayer, L.A., Janecek, T.R., Palmer-Julson, A. and van Andel, T.H., eds., 138, 885-893.


- Weber, ET, II, RM Owen, GR Dickens, AN Halliday, CE Jones, and DK Rea (1995) Significance of middle REE depletion in the eolian component of North Pacific Sediments, Trans. Am. Geophys. Union (EOS), AGU 1995 Spring Meeting Supplement, 76, 172.


- Weber, ET, II, RM Owen, GR Dickens, AN Halliday, CE Jones, and DK Rea (1995) Quantitative resolution of eolian continental crustal material and volcanic detritus in North Pacific surface sediment, Geophys. Abstr., 5(10), 8.


- Weber, ET, II, RM Owen, GR Dickens, AN Halliday, CE Jones, and DK Rea (1995) Pacific Surface Sediment:  Quantatitive resolution of continental eolian material and volcanic ash, 5th Int’l Conf. on Paleoceanography, Halifax, Program and Abstracts, 67-68.


- Altabet, MA, R Francois, and C Smith (1994) Comparison of Nitrogen and Carbon Isotopic Composition of Sediment Trap, Seafloor “Fluff”, and Sediment Samples from the Equatorial Pacific, EOS, abstr., 75, 397.


- Chan, LH, L Zhang, JR Hein (1994) Lithium Isotope Characteristics of Marine Sediments, EOS, abstr., 75, 314.


- Collier, RW and J Dymond (1994) Relationships Between Major Biogenic Carriers and Minor Element Particle Fluxes Along the EQPAC Transect, 1994 Ocean Sciences Meeting, San Diego, CA, EOS, abstr., 75, 83.


- Cousens, Brian L, James F Allan, and Michael P Gorton (1994) Subduction-modified pelagic sediments as the enriches component in back-arc basalts from the Japan Sea:  Ocean Drilling Program Sites 797 and 794, Contrib. Mineral Petrol, 117, 421-434.


- Darienzo, Mark E, Curt D Peterson, and Charles Clough (1994) Stratigraphic Evidence for Great Subduction-zone Earthquakes at four Estuaries in Northern Oregon, U.S.A., Journal of Coastal Research, 10, 850-876.


- Duncan, Robert A and LG Hogan (1994) Radiometric Dating of Young MORB Using the 40Ar-39Ar incremental Heating Method, Geophysical Research Letters, 21, 1927-1930.


- Duncan, Robert A, Martin R Fisk, William M White, and Roger L Nielson (1994) Tahiti:  Geochemical evolution of a French Polynesian volcano, Journal of Geophysical Research, 99, 24,341-23,357.


- Dymond, Jack and Mitchell Lyle (1994) Particle Fluxes in the Ocean and Implications for sources and Preservation of Ocean Sediments, in Material Fluxes on the Surface of the Earth, National Academy Press, 125-142.


- Farrell, JW and TF Pederson (1994) delta15-N patterns in Holocene and glacial-aged sediments of the eastern equatorial Pacific, EOS, abstr., 75, 385.


- Fluegge, Arnim (1994) Molecular-Isotopic derivation of maps of sea-surface temperature and oceanic pCO2 in the eastern equatorial Pacific., MS Thesis, Indiana University, 72pp.


- Hastings, D, S Emerson, and A Mix (1994) Vanadium Incorporation in Foraminiferal Calcite as a Tracer for Seawater Vanadium Concentrations, 1994 Ocean Sciences Meeting, San Diego, CA, EOS, abstr., 75, 79.


- Jasper, John P, JM Hayes, AC Mix, and FG Prahl (1994) Photosynthetic fractionation of 13C and concentrations of dissolved CO2 in the central equatorial Pacific during the last 255,000 years, Paleoceanography, 9, 781-798.


- Jones, CE, AN Halliday, DK Rea, and RM Owen (1994) Pacific surface sediment: A map of eNd variations in the North Pacific and its implications for detrital fluxes of REE to seawater, Trans. Am. Geophys. Union (EOS), AGU 1994 Spring Meeting Supplement, 207.


- Jones, Charles E, Alex N Halliday, David K Rea, Robert M Owen (1994) Neodymium isotopic variations in North Pacific modern silicate sediment and the insignificance of detrital REE contributions to seawater, Earth and Planetary Science Letters, 127, 55-66.


- Kelsey, HM, RC Witter, AR Nelson, and E Hemphill-Haley (1994) Repeated abrupt late Holocene environmental changes in south coastal Oregon:  stratigraphic evidence at Sixes River Marsh and Bradley Lake, Geological Society of America, Abstracts with Programs, 26, 524.


- Loubere, Paul (1994) A Quantitative Record of Surface Ocean Productivity and Bottom Water Oxygen Content From the Eastern Pacific for the last 25000 Years, EOS, abstr., 75, 347.


- Loubere, Paul (1994) Quantitative estimation of surface ocen productivity and bottom water oxygen concentration using benthic foraminifera, Paleoceanography, 9, 723-737.


- Moffett, SJ, and CA Brunner (1994) Faunal Response to Glacial Cycles in the Subarctic Northeast Pacific Ocean During the Brunhes Chron, EOS, abstr., 75, 389.


- Ortiz, J D, A C Mix and Steve Hostetler (1994) Comparison of Planktonic Foraminiferal Faunas from Mid-Latitude Sedimet Traps with Core Top and last Glacial Maximum Faunas, EOS, abstr., 75, 392.


- Ortiz, JD, AC Mix and RW Collier (1994) Environmental control of living symbiotic and asymbiotic foraminifers of the California Current, Paleoceanography, Submitted,


- Paytan, Adina and Miriam Kastner (1994) Reconstruction of Paleo-Circulation by Neodimium Isotope Ratios of Marine Barite, EOS Trans. AGU, Spring/Fall Meeting Suppl., Abstract O51C-07, 75, 386.


- Prahl, FG, JR Ertel, MA Goni, MA Sparrow, and B Eversmeyer (1994) Terrestrial organic carbon contributions to sediments on the Washington margin, Geochimica et Cosmochimica Acta, 58, 3035-3048.


- Rea, DK, SA Hovan, RM Owen, and AN Halliday (1994) Pacific surface sediment:  Physical characterization and transport processes of the terrigenous component, Trans. Am. Geophys. Union (EOS), 1994 Spring Meeting Supplement, 56-57.


- Russell, AD, S Emerson, Alan C Mix, Bruce K Nelson, and DW Lea (1994) U/Ca in G. sacculifer from Atlantic, Caribbean, and Pacific cores over last 30kyr, 1994 Ocean Sciences Meeting, San Diego, CA, EOS, abstr., 75, 79.


- Snoeckx, Hilde and David K Rea (1994) Late Quaternary CaCO3 stratigraphy of the eastern equatorial Pacific, Paleoceanography, 9, 341-351.


- Snoeckx, Hilde and David K Rea (1994) Late Pleistocene history of CaCO3 stratigraphy and organic carbon accumulation in the eastern equatorial Pacific, Trans. Am. Geophys. Union (EOS) AGU Spring meeting supplement, 205.


- Snoeckx, Hilde, David K Rea (1994) Late Pleistocene productivity variations along a north-south trans-equatorial transect at 110°W (eastern equatorial Pacific): organic carbon and CaCO3, EOS, abstr., 75, 350.


- Snoeckx, Hilde, David K Rea (1994) Dry bulk density and CaCO3 relationships in upper Quaternary sediments of the eastern equatorial Pacific, Marine Geology, 120, 327-333.


- Watkins, JM, AC Mix, J Wilson, R Collier, J Dymond (1994) Physical and Biological Control of Living Planktonic Foraminifers of the JGOFS Equatorial Pacific Transect, EOS, abstr., 75, 374.


- Weber, ET, RM Owen, GR Dickens, AN Halliday, CE Jones, and DK Rea (1994) Pacific Surface Sediment:  Quantitative resolution of continental eolian material and volcanic ash, Trans. Am. Geophys. Union (EOS), AGU 1994 Spring Meeting Supplement, 57.


- Witter, RC and HM Kelsey (1994) Abrupt late Holocene relative sea-level changes in three coastal marshes along the southern Oregon portion of the Cascadia subduction zone, EOS, 75, 621.


- Archer, D, M Lyle, K Rodgers, and P Froelich (1993) What Controls Opal Preservation in Tropical Deep-Sea Sediments?, Paleoceanography, 8, 41841.


- Graham, DW, DM Christie, KS Harpp, & JE Lupton (1993) Mantle Plume Helium in Submarine Basalts from the Galapagos Platform, Science, 262, 2023-2026.


- Jones, CE, DK Rea, and AN Halliday  (1993) Sr, Nd, and Pb isotopes in Pacific eolian dust samples:  in search of provenance, Trans. Am. Geophys. Union (EOS), AGU Fall Meeting Supplement, 127, 329.


- Keller, Randall A, JA Strelin, LA Lawver, and MR Fisk (1993) Dredging young volcanic rocks in Bransfield Strait, Antarctic Journal–Review 1993, 28 (5), 98-100.


- Lao, Yong, RF Anderson, WS Broecker, HJ Hofmann, W Wolfli (1993) Particulate fluxes of 230-Th, 231-Pa and 10-Be in the northeastern Pacific Ocean, Geochimica et Cosmochimica Acta, 57, 205-217.


- Loubere, Paul (1993) Quantitative Estimates of Surface Ocean Productivity and Deep Ocean Oxygen Concentration using Benthic Foraminifera, EOS, abstr., 74, 368.


- Moran, JE, U Fehn, and RTD Teng (1993) Spatial Variation in 129I/I Ratios in Marine Sediments:  Evidence for a Fossil Terrigenous Source Component, EOS, abstr., 74, 327.


- Paytan, Adina and M Kastner (1993) Increased Productivity in the Eastern Equatorial Pacific During the Last Glacial Maximum, Indication from Marine Barite, EOS, abstr., 74, 185.


- Prahl, FG, RB Collier, J Dymond, M Lyle, and MA Sparrow (1993) A biomarker perspective on prymnesiophyte productivity in the northeast Pacific Ocean, Deep-Sea Research, 40, 2061-2076.


- Sabin, AL (1993) Holocene Northeast Pacific Paleotemperature Records and Their Relationship to the Adjacent Continental Climate, EOS, abstr., 74, 366.


- Sinton, CW, DM Christie, VL Coombs, RL Nielsen, MR Fisk (1993) Near-Primary melt inclusions in anorthite phenocrysts from the Galapagos Platform, Earth and Planetary Science Letters, 119, 527-537.


- Snoeckx, Hilde, and David K Rea (1993) Late Quaternary CaCO3 stratigraphy of the eastern Equatorial Pacific, Geophys. Abstr., 3 (12), 13.


- Watkins, JM, AC Mix, and J Wilson (1993) Relating Equatorial Pacific Planktonic Foraminifera Species’ Standing Stocks to Physical and Biological Parameters, EOS, abstr., 74, 371.


- Welling, Leigh A, and Nicklas G Pisias (1993) Seasonal Trends and Preservation Biases of Polycystine Radiolaria in the Northern California Current System, Paleoceanography, 8, 351-372.


- Christie, DM, RA Duncan, AR McBirney, MA Richards, WM White, KS Harpp, CG Fox (1992) Drowned islands downstream from the Galapagos hotspot imply extended speciation times, Nature, 355, 246-248.


- Dymond, Jack and Robert Collier (1992) Particle Flux Measurements in Crater Lake, Oregon:  A Tool for Defining Lake Budgets and Processes, EOS, abstr., 73, 197.


- Dymond, Jack, Erwin Suess, Mitch Lyle (1992) Barium in Deep-Sea Sediment:  A geochemical proxy for paleoproductivity, Paleoceanography, 7, 163-181.


- Goldfinger, C, LD Kulm, RS Yeats B Appelgate, ME MacKay, GF Moore (1992) Transverse structural trends along the Oregon convergent margin:  Implications for Cascadia earthquake potential and crustal rotations, Geology, 20, 141-144.


- Hastings, D, S Emerson, B Nelson, A Mix, and J Erez (1992) Vanadium in Planktic Foraminifera as a Paleoceanographic Tracer of Sediment Redox Conditions, EOS, abstr., 73, 273.


- Jasper, JP and JM Hayes (1992) Carbon Isotopic reconstructions of oceanic and equilibrium atmospheric CO2 levels from sedimentary biogenic components, 4th International conference on Paleoceanography, Kiel, Germany, abstr., 329-330.


- Jasper, JP, FG Prahl,  AC Mix, and JM Hayes (1992) Estimated CO2 levels from photosynthetic 13C fractionation in the central Equatorial Pacific over the last 255,000 years, 4th International conference on Paleoceanography, Kiel, Germany, abstr., 156-157.


- Karlin, Robert, Mitchell Lyle, and Rainer Zahn (1992) Carbonate Variations in the Northeast Pacific during the late Quaternary, Paleoceanography, 7, 43-61.


- Keller, RA, MR Fisk, WM White, K Birkenmajer (1992) Isotopic and trace element constraints on mixing and melting models of marginal basin volcanism, Bransfield Strait, Antarctica, Earth and Planetary Science Letters, 111, 287-303.


- Keller, Randall A and Martin R Fisk (1992) Quaternary marginal basin volcanism in the Bransfield Strait as a modern analogue of the southern Chilean ophiolites, in Ophiolites and their Modern Oceanic Analogues Geological Society Special Publication No. 60; eds. Parson, L.M., Murton, B.J. and Browning, P., 155-169.


- Lao, Yong, RF Anderson, WS Broecker, SE Trumbore, HJ Hofmann, W Wolfli (1992) Transport and burial rates of 10-Be and 231-Pa in the Pacific Ocean during the Holocene period, Earth and Planetary Science Letters, 113, 173-189.


- Lao, Yong, Robert F Anderson, and Wallace S Broecker (1992) Boundary Scavenging and Deep-sea Sediment Dating:  Constraints From Excess 230-Th and 231-Pa, Paleoceanography, 7, 783-798.


- Lyle M, R Zahn, F Prahl, J Dymond,R Collier,N Pisias,E Suess (1992) Paleoproductivity and carbon burial across the California current:  the Multitracers Transect, 42°N, Paleoceanography, 7, 251-272.


- Lyle, Mitchell (1992) Composition Maps of Surface Sediments of the Eastern Tropical Pacific Ocean, Proceedings of the Ocean Drilling Program, Initial Reports, Vol. 138; Mayer, L., Pisias, N., Janecek, T., et al., eds., 138, 101-115.


- Lyle, MW, FG Prahl and MA Sparrow (1992) Upwelling and productivity changes inferred from a temperature record in the central equatorial Pacific, Nature, 355, 812-815.


- Mayer, Larry A, NG Pisias, AC Mix, MW Lyle, P Arason, & D Mosher (1992) Site Surveys, Proceedings of the Ocean Drilling Program, Initial Reports, Vol. 138; Mayer, L., Pisias, N., Janecek, T., et al., eds., 138, 93-100.


- McGann, ML, A van Geen, JV Gardner (1992) Evidence for Intensified Upwelling in the California Current 9,000 years ago from Cd/Ca in Planktonic Foraminifera, EOS, abstr., 73, 275.


- Ortiz, JD, AC Mix and R Collier (1992) Planktonic Foraminifers in MOCNESS tows from the California Current during September 1990, 4th International conference on Paleoceanography, Kiel, Germany, abstr., 222.


- Ortiz, JD, AC Mix, and RW Collier (1992) Planktic foraminifers and Plankton Biomass in the California Current at 42°N in September, 1990, EOS, abstr., 73, 310.


- Ortiz, Joseph D and Alan C Mix (1992) The spatial distribution and seasonal succession of planktonic foraminifera in the California Current off Oregon, Sept. 1987–Sept. 1988, Upwelling Systems: Evolution Since the Early Miocene Summerhayes, CP, Prell WL & Emeis, KC, eds.; Geological Society Special Publication No. 64., 197-213.


- Peterson, Curt D and James B Phipps (1992) Holocene Sedimentary Framework of Grays Harbor Basin, Washington, USA, in: Quaternary Coasts of the United States:  Marine and Lacustrine Systems; SEPM spec. publ. No. 48, 273-285.


- Prahl, FG, MA Sparrow, and B Eversmeyer (1992) Biomarker perspective on oceanographic changes in the northeast Pacific during the last glacial-interglacial transition, 4th International conference on Paleoceanography, Kiel, Germany, abstr., 231-232.


- Prahl, Fredrick G (1992) Prospective Use of Molecular Paleontology to Test for Iron Limitation on Marine Primary Productivity, Marine Chemistry, 39, 167-185.


- Pyle, Douglas G, David M Christie, and John J Mahoney (1992) Resolving an isotopic boundary within the Australian-Antarctic Discordance, Earth and Planetary Science Letters, 112, 161-178.


- Roth Franks, Sharon Elaine (1992) Temporal and Spatial Variability in the Endeavour Ridge Neutrally Buoyant Hydrothermal Plume:  Patterns, Forcing Mechanisms and Biogeochemical Implications , phD thesis, Oregon State University, 303 pages.


- Sancetta, C, Lyle M, Heusser L, Zahn R, Bradbury JP (1992) Late-Glacial to Holocene Changes in Winds, Upwelling, and Seasonal Production of the Northern California Current System, Quaternary Research, 38, 359-370.


- Sancetta, Constance (1992) Comparison of Phytoplankton in Sediment Trap Time Series and Surface Sediments Along a Productivity Gradient, Paleoceanography, 7, 183-194.


- Schrader, Hans (1992) Coastal upwelling and atmospheric CO2 changes over the last 400,000 years:  Peru, Marine Geology, 107, 239-248.


- von Breymann, Marta T, Kay-Christian Emeis & Erwin Suess (1992) Water depth and diagenetic constraints on the use of barium as a palaeoproductivity indicator, Upwelling Systems: Evolution Since the Early Miocene Summerhayes, CP, Prell WL & Emeis, KC, eds.; Geological Society Special Publication No. 64., 273-284.


- Welling, LA, and NG Pisias (1992) Seasonal trends and preservation biases of polycystine radiolaria in the northern California current system, 4th International conference on Paleoceanography, Kiel, Germany, abstr., 298-299.


- Welling, LA, NG Pisias, and M Roman (1992) Comparison of the 1982 and the 1992 El Ninos Using the Relative Abundance Patterns of Polycystine Radiolaria from the Equatorial Pacific, EOS, abstr., 73, 296.


- Welling, Leigh A, Nicklas G Pisias, & Adrienne K Roelofs (1992) Radiolarian microfauna in the northern California Current System:  indicators of multiple processes controlling productivity, Upwelling Systems: Evolution Since the Early Miocene Summerhayes, CP, Prell WL & Emeis, KC, eds.; Geological Society Special Publication No. 64., 177-195.


- White, William M, Karen S Harpp, RA Duncan, DM Christie, & AR McBirney (1992) Plume-Ridge Interaction in the Galapagos I:  Plume-Asthenosphere Mixing, EOS, abstr., 73, 583.


- Calvert, SE and RE Karlin (1991) Relationships between sulphur, organic carbon, and iron in the modern sediments of the Black Sea, Geochimica et Cosmochimica Acta, 55, 2483-2490.


- Calvert, SE, RE Karlin, LJ Toolin, DJ Donahue, JR Southon, & JS Vogel (1991) Low organic carbon accumulation rates in Black Sea sediments, Nature, 350, 692-695.


- Crusius, John and Robert F Anderson (1991) Core Compression and surficial sediment loss of lake sediments of high porosity caused by gravity coring, Limnol. Oceanogr., 36, 1021-1031.


- Dickens, GR, RM Owen, DK Rea, and SA Hovan (1991) A geochemical method for estimating the eolian component in marine sediments, Trans. Am. Geophys. Union (EOS, Fall Meeting Program and Abstracts), 72, 265.


- Dymond, J, E Suess, and M Lyle (1991) Barium in Deep Sea Sediment:  A Geochemical Indicator of Paleoproductivity, EOS, abstr., 72, 273.


- Hathon, Eric G and Michael B Underwood (1991) Clay mineralogy and chemistry as indicators of hemipelagic sediment dispersal south of the Aleutian arc, Marine Geology, 97, 145-166.


- Jasper, J, F Prahl, AC Mix, and J Hayes (1991) Photosynthetic 13C fractionation and estimated CO2 levels in the eastern equatorial Pacific (MANOP Site C) over the last 255,000 years., EOS, abstr., 72, 167.


- Jasper, JP, JM Hayes, FG Prahl, A Mix, SG Wakeham, J Crusius, RF Anderson (1991) Isotopically-Derived Estimates of Dissolved CO2 and Equilibrium pCO2 from late Quaternary Sedimentary Records in the Equatorial Pacific and the Black Sea, EOS, abstr., 72, 272.


- Loubere, Paul (1991) Deep-Sea Benthic Foraminiferal Assemblage Response to a Surface Ocean Productivity Gradient:  A Test, Paleoceanography, 6, 193-204.


- Loubere, Paul (1991) Eastern Equatorial Pacific Surface Ocean Productivity and Bottom Water Oxygen concentration over last 30,000 years, EOS, abstr., 72, 261.


- Lyle, MW, A Mix and NG Pisias (1991) Patterns of Carbonate Deposition in the Eastern Tropical Pacific Ocean for the last 150Kyr:  Evidence for a SE Pacific Depositional Spike at 18ka, EOS, abstr., 72, 261.


- Mix, AC, NG Pisias, and MW Lyle (1991) Spatial variability of circulation in the Eastern Tropical Pacific, 0-150,000 years:  Planktonic foraminifera, stable isotopes, and radiolaria, EOS, abstr., 72, 261.


- Moore, Willard S and Jack Dymond (1991) Fluxes of 226-Ra and barium in the Pacific Ocean:  The importance of boundary processes, Earth and Planetary Science Letters, 107, 55-68.


- Olivarez, AM, RM Owen, and DK Rea (1991) Geochemistry of eolian dust in Pacific pelagid sediments:  Implications for paleoclimatic interpretations, Geochimica et Cosmochimica Acta, 55, 2147-2158.


- Peterson, Curt D and Mark E Darienzo (1991) Discrimination of Climatic, Oceanic and Tectonic Mechanisms of Cyclic marsh burial from Alsea Bay, Oregon, USA, USGS open file report 91-441-C to be published as USGS Professional Paper 1560; AM Rogers, TJ Walsh, WJ Kockelman, GR Priest, eds.,


- Pisias, NG, A Mix, and M Lyle (1991) Modes of sea surface temperature variability in the eastern equatorial Pacific during the last 150,000 years, EOS, abstr., 72, 261.


- Snoeckx, Hilde, and David K Rea (1991) Late Pleistocene CaCO3 abundance patterns in the eastern Equatorial Pacific Ocean, Trans. Am. Geophys. Union (EOS, Spring Meeting Program and Abstracts), 72, 159-160.


- Snoeckx, Hilde, David K Rea, and Alan C Mix (1991) CaCO3 and eolian components in late Quaternary sediments of the Eastern Equatorial Pacific Ocean, Trans. Am. Geophys. Union (EOS, Fall Meeting Program and Abstracts), 72, 261.


- Underwood, Michael B (1991) Submarine Canyons, Unconfined Turbidity Currents, and Sedimentary Bypassing of Forearc Regions, Reviews in Aquatic Sciences, 4, 149-200.


- Zahn R, A Rushdi, N Pisias, B Bornhold, B Blaise, R Karlin (1991) Carbonate deposition and benthic d-13C in the subarctic Pacific:  implications for changes of the oceanic carbonate system during the past 750,000 yr, Earth and Planetary Science Letters, 103, 116-132.


- Zahn, R and AC Mix (1991) Benthic foraminiferal delta18-O in the oceans temperature-salinity-density field:  Constraints on ice-age thermohaline circulation, Paleoceanography, 6, 41659.


- Zahn, R, TF Pederson, BD Bornhold and AC Mix (1991) Water mass conversion in the glacial subarctic Pacific (54°N, 148°W):  Physical constraints and the benthic-planktonic stable isotope record, Paleoceanography, 6, 543-560.


- Arason, Pordur (1990) Whole-core Magnetic Susceptibility Measurements During the VNTR01 Expedition 1989:  Dating Quat. Sed. Using Climate-Susceptibility Correlations, Report OSU-CO-90-1-149,


- Darienzo, Mark E and Curt D Peterson (1990) Episodic Tectonic Subsidence of Late Holocene Salt Marshes, Northern Oregon Central Casacdia Margin, Tectonics, 9, 41661.


- Dymond, Jack and Robert Collier (1990) The Chemistry of Crater Lake Sediments:  Definition of Sources and Implications for Hydrothermal Activity, in Crater Lake An Ecosystem Study Ellen T. Drake,G.L. Larson, J. Dymond, R. Collier, eds.; 69th annual meeting, Pacific Division/AAAS,


- Fisk, MR (1990) Volcanism in the Bransfield Strait, Antarctica, Journal of South American Earth Sciences, 3, 91-101.


- Hastings, David, Steven Emerson, Alan Mix, Bruce Nelson (1990) Vanadium Incorporation into Planktonic Foraminifera as a Tracer for the Extent of Anoxic Bottom Water, EOS, abstr., 71, 1351.


- Heusser, Calvin J and Heusser, Linda E (1990) Long continental pollen sequence from Washington State (USA):  correlation of upper levels with marine pollen-oxygen isotope stratig. through substage 5e, Palaeogeography, Palaeoclimatology, Palaeoecology, 79, 63-71.


- Huh, Chih-An and TL Ku (1990) Distribution of Thorium 232 in Manganese Nodules and Crusts; Paleoceanographic Implications, Paleoceanography, 5, 187-195.


- Karlin, Robert (1990) Magnetite Diagenesis in Marine Sediments From the Oregon Continental Margin, Journal of Geophysical Research, 95, 4405-4419.


- Karlin, Robert (1990) Magnetite Mineral Diagenesis in Suboxic Sediments at Bettis Site W-N, NE Pacific Ocean, Journal of Geophysical Research, 95, 4421-4436.


- Kastner, Miriam, etal (1990) 25.  Diagenesis and intersitital-water chemistry at the Peruvian continental margin–major constituents and strontium isotopes, Proceedings of the Ocean Drilling Program Suess, E. von Huene, R., et al, eds., 112, 413-440.


- Kulm, LaVerne and Erwin Suess (1990) Relationship Between Carbonate Deposits and Fluid Venting:  Oregon Accretionary Prism, Journal of Geophysical Research, 95, 8899-8915.


- Leonard, Eric (1990) An assessment of sediment loss and distortion at the top of short gravity cores, Sedimentary Geology, 66, 57-63.


- Moore, J Casey, Dan Orange, and LaVern D Kulm (1990) Interrelationship of Fluid Venting and Structural Evolution:  ALVIN Observations From the Frontal Accretionary Prism, Oregon, Journal of Geophysical Research, 95, 8795-8808.


- Russell, AD, SR Emerson, BK Nelson, A Mix, J Erez (1990) Uranium in Foraminiferal Calcite as a Tracer of Ocean Redox Conditions, EOS, abstr., 71, 1352.


- Thornburg, Todd M and Erwin Suess (1990) 7.  Carbonate cementation of Granular and Fracture Porosity:   Implications for the Cenozoic Hydrologic Development of the Peru Continental Margin, Proceedings of the Ocean Drilling Program Suess,E. von Huene, R., et al., ed., 112, 95-109.


- Thornburg, Todd M, LaVerne D Kulm, Donald M Hussong (1990) Submarine-fan development in the southern Chile Trench:  A dynamic interplay of tectonics and sedimentation, Geological Society of America Bulletin, 102, 1658-1680.


- Wefer, G, P Heinze and E Suess (1990) 21.  Stratigraphy and Sedimentation Rates from Oxygen isotope composition, organic carbon content, and grain-size distribution at the Peru upwelling region: Holes 680B and 686B, Proceedings of the Ocean Drilling Program Suess, E. von Huene, R., et al, eds., 112, 355-367.


- Whiticar, Michael J and Erwin Suess (1990) 33.  Characterization of sorbed volatile hydrocarbons from the Peru margin, Leg 112, Sites 679, 680/681, 682, 684, and 686/687, Proceedings of the Ocean Drilling Program Suess, E. von Huene, R., et al, eds., 112, 527-538.
`}</SemanticMDX>
	);
};

const Publications1980to1989: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
The OSU-MGR has a long history of assisting with scientific research resulting in over 400 scientific publications. These are also listed  in a [Google Scholar Citation](https://scholar.google.com/citations?hl=en&user=x5lYe50AAAAJ&view_op=list_works) page. If you use our cores and publish the data on them then please drop us an email to keep this page updated!

- Duncan, Robert A and LaVerne D Kulm (1989) Plate tectonic evolution of the Cascades arc-subduction complex, in The Geology of N. America, The Eastern Pacific Ocean and Hawaii Winterer, EL, DM Hussong, RW Decker, eds; Geological society of America, Boulder CO., N, 413-437.


- Han, MW and ESuess (1989) Subduction-Induced Pore Fluid Venting & the Form- ation of Authigenic Carbonates Along the Cascadia Con. Mar.: Implication for the Global Ca-Cycle, Palaeogeography, Palaeoclimatology, Palaeoecology, 71, 97-118.


- Huh, Chih-An (1989) The Ionium Method of Dating Deep-Sea Sediments:  A Reprise, Proceedings of the Geological Society of China, 32, 255-266.


- Huh, Chih-An, Willard S Moore & David C Kadko (1989) Oceanic 232Th:  A reconnaissance and implications of global distribution from manganese nodules, Geochimica et Cosmochimica Acta, 53, 1357-1366.


- Loubere, Paul (1989) Bioturbation and Sedimentation Rate Control of Benthic Microfossil Taxon Abundances in Surface Sediments:  A Theoretical Approach to the Analysis of Species Microhabitats, Marine Micropaleontology, 14, 317-325.


- Olivarez, AM, RM Owen, and DK Rea (1989) REE geochemistry of eolian dust in Pacific pelagic sediments, Trans. Am. Geophys. Union (EOS), 70, 1138.


- Prahl, FG and LA Muehlhausen (1989) Lipid Biomarkers as Geochemical Tools for Paleoceanographic Study, Productivity of the Ocean: Present and Past W.H. Berger, V.S. Smetacck, and G. Wefer, eds., 271-289.


- Prahl, FG, LA Muehlhausen and M Lyle (1989) An Organic Geochemical Assessment of Oceanographic Conditions at MANOP Site C Over the Past 26,000 Years, Paleoceanography, 4, 495-510.


- Roth, Sharon E and Jack Dymond (1989) Transport and settling of organic material in a deep-sea hydrothermal plume:  evidence from particle flux measurements, Deep-Sea Research, 36, 1237-1254.


- Suess, E and MJ Whiticar (1989) Methane-Derived CO2 in Pore Fluids Expelled from the Oregon Subduction Zone, Palaeogeography, Palaeoclimatology, Palaeoecology, 71, 119-136.


- Underwood, Michael B and Eric G Hathon (1989) Provenance and Dispersal of Muds South of the Aleutian Arc, North Pacific Ocean, Geo-Marine Letters, 9, 67-75.


- Dymond, Jack and Robert Collier (1988) Biogenic Particle Fluxes in the Equatorial Pacific:  Evidence for both high and low Productivity during the 1982-1983 El Nino., Global Biogeochemical Cycles, 2, 129-137.


- Dymond, Jack and Sharon Roth (1988) Plume dispersal hydrothermal particles: A time-series record of settling flux from the Endeavor Ridge using moored sensors, Geochimica et Cosmochimica Acta, 52, 2525-2536.


- Finney, Bruce P, Mitchell W Lyle, G Ross Heath (1988) Sedimentation at MANOP Site H (Eastern Equatorial Pacific) over the past 400,000 yrs:  Climatically induced redox variations and their effects on transition metal cycling, Paleoceanography, 3, 169-189.


- Han, Myung Woo (1988) Dynamics and Chemistry of Pore Fluids in Marine Sediments of Different Tectonic Settings:  Oregon Subduction Zone and BransfieldStraitExtensionalBasi, pHD Thesis, Oregon State University, 280 pp.


- Hathon, Eric Gene (1988) Clay Mineral Distribution and Elemental Variability in Near-Surface, Fine-Grained Sediments from the Aleutian Trench System, MS Thesis, University of Missouri-Columbia, 204 pp.


- Heusser, Linda E and James E King (1988) North America with special emphasis on the Development of the Pacific Coastal Forest and Prairie/Forest Boundary Prior to the Last Glacial Max, Vegetation History; Huntley B. and Webb, T. III, eds., 193-236.


- Howard, Katherine J and Martin R Fisk (1988) Hydorthermal alumina-rich clays and boehmite on the Gorda Ridge, Geochimica et Cosmochimica Acta, 52, 2269-2279.


- Kulm, LaVerne D (1988) Potential Heavy Mineral and Metal Placers on the Southern Oregon Continental Shelf, Marine Mining, 7, 361-395.


- Kulm, LaVerne D and Curt D Peterson (1988) Elemental Content of Heavy-Mineral Conc. on the Continental Shelf off Oregon and Northernmost California, OR dept of Geol. and Mineral Industries OPEN-FILE REPORT O-88-4, 29pp.


- Lyle, M, D Murray, BP Finney, J Dymond, JM Robbins, K Brooksforce (1988) The Record of Late Pleistocene Biogenic Sedimentation in the Eastern Tropical Pacific Ocean, Paleoceanography, 3, 39-59.


- Lyle, Mitchell (1988) Climatically forced organic carbon burial in equatorial Atlantic and Pacific Oceans, Nature, 335, 529-532.


- Moore, Willard S and Jack Dymond (1988) Correlation of 210-Pb removal with organic carbon fluxes in the Pacific Ocean, Nature, 331, 339-341.


- Peterson, CD, ME Darienzo and M Parker (1988) Coastal neotectonic field trip guide for Netarts Bay, Oregon, Oregon Geology, 50, 99-106.


- Peterson, Curt D, LD Kulm, PD Komar, amd MS Mumford  (1988) Marine Placer Studies in the Pacific Northwest, Oregon Sea Grant  ORESU-R-88-019 R/CP-20, R/CP-24, and R/CM-31,


- Prahl, FG, LA Muehlhausen, and DL Zahnle (1988) Further evaluation of long-chain alkenones as indicators of paleoceanographic conditions, Geochimica et Cosmochimica Acta, 52, 2303-2310.


- von Breymann, Marta T (1988) Magnesium in Hemipelagic environments:  Surface Reactions in the Sediment-Pore water System, Phd thesis, Oregon State University, 224 pp.


- von Breymann, Marta T and Erwin Suess (1988) Magnesium in the Marine Sedimentary Environment:  Mg-NH4 Ion Exchange, Chemical Geology, 70, 359-371.


- von Breymann, Marta T, C Andre Ungerer & Erwin Suess (1988) Mg-NH4 Exchange on Humic Acid:  A radiotracer technique for Conditional Exchange Constants in an Seawater Medium, Chemical Geology, 70, 349-357.


- Walsh, Ian, Jack Dymond and Robert Collier (1988) Rates of recycling of biogenic components of settling particles in the ocean derived from sediment trap experiments, Deep-Sea Research, 35, 43-58.


- Walsh, Ian, K Fischer, D Murray, and J Dymond (1988) Evidence for resuspension of rebound particles from near-bottom sediment traps, Deep-Sea Research, 35, 59-70.


- Finney, Bruce Preston (1987) Paleoclimatic Influence on Sedimentation and Manganese Nodule Growth During the Past 400,000 years at MANOP Site H (Eastern Equatorial Pacific), pHD thesis, Oregon State University, 195pp.


- Kadko, David, J Kirk Cochran, and Mitchell Lyle (1987) The effect of bioturbation and adsorption gradients on solid and dissolved radium profiles in sediments from the eastern equatorial Pacific, Geochimica et Cosmochimica Acta, 51, 1613-1623.


- Karlin, Robert, Mitchell Lyle, & GRoss Heath (1987) Authigenic magnetite formation in suboxic marine sediments, Nature, 326, 490-493.


- Murray, David W (1987) Spatial and Temporal Variations in Sediment Accumulation in the Central Tropical Pacific, pHD thesis, Oregon State University, 343 pp.


- Schroeder, Nanci AM, LaVerne D Kulm, Gary E Muehlberg (1987) Carbonate chimneys on the outer continental shelf:  Evidence for fluid venting on the Oregon margin, Oregon Geology, 49, 91-96.


- Spivack, AJ, MR Palmer, and JM Edmond (1987) The sedimentary cycle of the boron isotopes, Geochimica et Cosmochimica Acta, 51, 1939-1947.


- Stockwell, Dean A (1987) Intraspecific morphological variability within resting spores of the marine diatom Chaetoceros ehrenberg, phD thesis, University of Rhode Island, 193pp.


- Suess, E, LD Kulm and JS Killingley (1987) Coastal upwelling and a history of organic-rich mudstone deposition off Peru, Marine Petroleum Source Rocks Brooks, J. and Fleet, A.J. (eds) Geological Society Special Publication No. 26, 181-197.


- Thornburg, Todd M and LaVerne D Kulm (1987) Sedimentation in the Chile Trench: Petrofacies and Provenance, Journal of Sedimentary Petrology, 57, 55-74.


- Thornburg, Todd M and LaVerne D Kulm (1987) Sedimentation in the Chile Trench:  Depositional morphologies, lithofacies, and stratigraphy, Geological Society of America Bulletin, 98, 33-52.


- Verplanck, Emily P and Robert A Duncan (1987) Temporal Variations in Plate convergence and eruption rates in the Western Cascades, Oregon, Tectonics, 6, 197-209.


- White, William M, AW Hoffman and H Puchelt (1987) Isotopic Geochemistry of Pacific Mid-Ocean Ridge Basalt, Journal of Geophysical Research, 92, 4881-4893.


- Baba, Jumpei (1986) Terrigenous Sediments in two Continental Margin Environments:  Western South America and the Gulf of California,  pHD thesis, Oregon State University, 200 pp.


- Fischer, K, J Dymond, M Lyle, A Soutar, S Rau (1986) The benthic cycle of copper:  Evidence from sediment trap experiments in the eastern tropical North Pacific Ocean, Geochimica et Cosmochimica Acta, 50, 1535-1543.


- Heusser, Linda E (1986) Pollen in Marine Cores:  Evidence of Past Climates, Oceanus, 29, 64-70.


- Karlin, Robert and Lyle, Mitchell (1986) Sediment Studies on the Gorda Ridge, State of Oregon, Department of Geology and Mineral Industries, Open file Report O-86-19, 76pp.


- Kulm, LD, E Suess, etal (1986) Oregon Subduction Zone: Venting, Fauna, and Carbonates, Science, 231, 561-566.


- Leinen, M, D Cwienk, GR Heath, PE Biscaye, V Kolla, J Thiede and JP Dauphin (1986) Distribution of biogenic silica and quartz in recent deep-sea sediments, Geology, 14, 199-203. doi: https://dx.doi.org/10.1130/0091-7613 (1986) 142.0.CO;2


- Muller, PJ, E Suess, and CA Ungerer (1986) Amino acids and amino sugars of surface particulate and sediment trap material from waters of the Scotia Sea, Deep-Sea Research, 33, 819-838.


- Pisias, Nicklas G, DW Murray, A K Roelofs (1986) RAdiolarian and silicoflagellate response to oceanographic changes associated with the 1983 El Nino, Nature, 320, 259-262.


- Simoneit, BRT, JO Grimalt, K Fischer, J Dymond (1986) Upward and Downward Flux of Particulate Organic Material in Abyssal Waters of the Pacific Ocean, Naturwissenshaften, 73, 322-325.


- Dymond, Jack and Mitchell Lyle (1985) Flux comparisons between sediments and sediment traps in the eastern tropical Pacific:  Implications for atmospheric CO2 variations during Pleistocene, Limnol. Oceanogr., 30, 699-712.


- Emerson, Steven, K Fischer, C Reimers, and D Heggie (1985) Organic carbon dynamics and preservation in deep-sea sediments, Deep-Sea Research, 32, 41660.


- Heusser, Linda E (1985) Quaternary Palynology of Marine Sediments in the Northeast Pacific, Northwest Atlantic, and Gulf of Mexico, Pollen Records of Late-Quaternary N. American Sediments, 385-403.


- Karlin, Robert and Shaul Levi (1985) Geochemical and sedimentological control of the magnetic properties of hemipelagic sediments, Journal of Geophysical Research, 90, 10,373-10,392.


- Murphy, Kim (1985) Transition Metal and Rare Earth Element Fluxes at Two Sites in the EAstern Tropical Pacific:  Relationship to Ferromanganese Nodule Genesis, MS Thesis, Oregon State University, 120pp.


- Rea, David K , Gordon E Ness, and G Ross Heath (1985) Hemipelagic Sedimentation in a Region of Crustal Doming Between the Mendocino and Pioneer Fracture Zones, Marine Geology, 62, 69-84.


- Suess, E, B Carson, S Ritger, etal (1985) Biological Communities at vent sites along the subduction zone off Oregon, Biol. Soc. Wash. Bull., 475-484.


- Whiticar, MJ, E Suess and H Wehner (1985) Thermogenic hydrocarbons in surface sediments of the Bransfield Strait, Antarctic Peninsula, Nature, 314, 87-90.


- Dymond, J, M Lyle, B Finney, D Piper, K Murphy, R Conard, N Pisias (1984) Ferromanganese nodules from MANOP Sites H, S, and R–Control of mineralogical and chemical composition by multiple accretionary processes, Geochimica et Cosmochimica Acta, 48, 931-949.


- Finney, Bruce, G Ross Heath and Mitchell Lyle (1984) Growth rates of manganese-rich nodules at MANOP Site H (Eastern North Pacific), Geochimica et Cosmochimica Acta, 48, 911-919.


- Fischer, Kathleen M (1984) Particle Fluxes in the Eastern Tropical Pacific Ocean-Sources and Processes, pHd Thesis, Oregon State University, 225 pp.


- Graybell, Amy L and G Ross Heath (1984) Remobilization of transition metals in surficial pelagic sediments from the eastern Pacific, Geochimica et Cosmochimica Acta, 48, 965-975.


- Heath, GR anc C Lopez (1984) Data Report on Sediment Cores Collected on Cruise W8209B Pacific Study Area W-N, Oregon State University, OSU-23, 33pp.


- Heath, GR, DK Rea, G Ness, RD Pillsbury, TM Beasley, C Lopez (1984) Oceanographic Studies Supporting the Assessment of Deep-Sea Disposal of Defueled Decommissioned Nuclear Submarines, Environ Geol Water Sci, 6, 189-199.


- Huh, Chih-An and Teh-Lung Ku (1984) Radiochemical observations on manganese nodules from three sedimentary environments in the north Pacific, Geochimica et Cosmochimica Acta, 48, 951-963.


- Kadko, David and G Ross Heath (1984) Models of Depth-Dependent Bioturbation and Manop Site H in the Eastern Equatorial Pacific, Journal of Geophysical Research, 89, 6567-6570.


- Kalhorn, Susan and Steven Emerson (1984) The oxidation satate of manganese in surface sediments of the deep sea, Geochimica et Cosmochimica Acta, 48, 897-902.


- Karlin, Robert (1984) Paleomagnetism, Rock Magnetism, and Diagenesis in Hemipelagic Sediments from the NorthEast Pacific Ocean and the Gulf of California, pHd Thesis, Oregon State University, 246pp.


- Kulm, LaVerne D, Erwin Suess, and Todd M Thornburg (1984) Dolomites in Organic-rich muds of the Peru forearc basins: Analogue to the Monterey formation, Dolomites of the Monterey Formation and Other Organic-Rich Units: Pacific Section S.E.P.M. Garrison, Robert E., Kastner, Miriam and Zenger, Donald H. eds., 41, 29-47.


- Leinen, Margaret and Nicklas Pisias (1984) An objective technique for determining end-member compositions and for partitioning sediments according to their sources, Geochimica et Cosmochimica Acta, 48, 47-62.


- Lyle, Mitchell, G Ross Heath, James M Robbins (1984) Transport & release of transition elements during early diagenesis:  Sequential leaching of seds from MANOP Sites M & H.  Part I. pH5 acetic acid leach, Geochimica et Cosmochimica Acta, 48, 1705-1715.


- Moore, Willard S (1984) Thorium and radium isotopic relationships in manganese nodules and sediments at MANOP Site S, Geochimica et Cosmochimica Acta, 48, 987-992.


- Murphy, Kim and J Dymond (1984) Rare earth element fluxes and geochemical budget in the eastern equatorial Pacific, Nature, 307, 444-447.


- Peterson, Curt D, KF Scheidegger, and HJ Schrader (1984) Holocene Depositional Evolution of a small Active-margin Estuary of the Northwestern United States, Marine Geology, 59, 51-83.


- Reimers, Clare E, S Kalhorn, SR Emerson, and KH Nealson (1984) Oxygen consumption rates in pelagic sediments from the Central Pacific:  First estimates from microelectrode profiles, Geochimica et Cosmochimica Acta, 48, 903-910.


- Fischer, K, J Dymond, C Moser, D Murray, A Matherne (1983) Seasonal Variation in Particulate Flux in an Offshore area Adjacent to Coastal Upwelling, Coastal Upwelling, Part A Edited by Erwin Suess and Jorn Thiede  (Plenum Publishing Corporation),


- Hesse, KF, H Kuppers, and E Suess (1983) Refinement of the structure of Ikaite, CaCO3.6H2O, Zeitschrift fur Kristallographie, 163, 227-231.


- Karlin, Robert and Shaul Levi (1983) Diagenesis of magnetic minerals in recent haemipelagic sediments, Nature, 303, 327-330.


- Lyle, Mitchell (1983) The brown-green color transition in marine sediments: A marker of the Fe(III)-Fe(II) redox boundary, Limnol. Oceanogr., 28, 1026-1033.


- Murray, David and Hans Schrader (1983) Distribution of Silicoflagellates in Plankton and Core Top Samples from the Gulf of California, Marine Micropaleontology, 7, 517-539.


- Reimers, Clare E and E Suess (1983) The partitioning of organic carbon fluxes and sedimentary organic matter decomposition rates in the ocean, Marine Chemistry, 13, 141-168.


- Wefer, G, RB Dunbar, and E Suess (1983) Stable Isotopes of Foraminifers off Peru recording high fertility and changes in upwelling history, Coastal Upwelling, Part B Jorn Thiede and Erwin Suess, ed., 295-308.


- Weliky, Karen, E Suess, CA Ungerer (1983) Problems with accurate carbon meausrements in marine sediments and particulate matter in seawater: A new approach, Limnol. Oceanogr., 28, 1252-1259.


- Donegan, David P (1982) Modern and Ancient Marine Rhythmites from the Sea of Cortez and California Continental Borderland:  A Sedimentological Study, MS Thesis, Oregon State University,


- Duncan, Robert A (1982) A Captured Island chain in the coast range of Oregon and Washington, Journal of Geophysical Research, 87, 10,827-10,837.


- Emerick, CM and RA Duncan (1982) Age progressive volcanism in the Comores Archipelago, western Indian Ocean and implications for Somali plate tectonics, Earth and Planetary Science Letters, 60, 415-428.


- Krissek, LA (1982) Sources, dispersal and contributions of fine-grained terrigenous sediments on the Oregon and Washington continental slope, pHd thesis, Oregon State University, 226 pp.


- Loubere, Paul (1982) The Western Mediterranean During the Last Glacial:  Attacking a No-analog Problem, Marine Micropaleontology, 7, 311-325.


- Murray, David and Hans Schrader (1982) 63.  The size distribution of the centric diatom Coscinodiscus Nodulifer, Site 480, Guaymas Basin Slope, Gulf of California, Initial Reports of the Deep Sea Drilling Project Curray, J.R., Moore, D. G. et.al.  Washington (U.S. Government Printing Office), 64, 1239-1244.


- Reimers, Clare E (1982) Organic matter in anoxic sediments off central peru:  Relations of porosity, microbial decomposition and deformation properties, Marine Geology, 46, 175-197.


- Scheidegger, Kenneth F and Lawrence A Krissek (1982) Dispersal and deposition of eolilan and fluvial sediments off Peru and northern Chile, Geological Society of America Bulletin, 93, 150-162. doi: https://dx.doi.org/10.1130/0016-7606(1982)932.0.CO;2


- Schuette, Gretchen and Hans Schrader (1982) Thalassiothrix pseudonitzschioides sp. nov.: A common Pennate Diatom from the Gulf of California, Bacillaria, 5, 213-223.


- Suess, E, W Balzer, KF Hesse, etal (1982) Calcium Carbonate Hexahydrate from Organic-Rich Sediments of the Antarctic Shelf:  Precursors of Glendonites, Science, 216, 1128-1131.


- Dasch, E Julius (1981) Lead isotopic composition of metalliferous sediments from the Nazca plate, in Nazca Plate:  Crustal Formation and Andean Convergence.  Geological Society of America, Memoir 154., 154, 199-209.


- DeMaster, David J (1981) The supply and accumulation of silica in the marine environment, Geochimica et Cosmochimica Acta, 45, 1715-1732.


- Dymond, Jack (1981) Geochemistry of Nazca plate surface sediments: An evaluation of hydrothermal, biogenic, detrital, and hydrogenous sources, in Nazca Plate:  Crustal Formation and Andean Convergence.  Geological Society of America, Memoir 154., 154, 133-173.


- Dymond, Jack, KFischer, MClauson, RCobler, etal (1981) A sediment trap intercomparison study in the Santa Barbara Basin, Earth and Planetary Science Letters, 53, 409-418.


- Heath, GR (1981) Low Level Waste Ocean Disposal Program.  Characteristics of bottom sediments collected from area W-N during RV T. Thompson Cruise TT-141, August 1979.  Report OSU-8.  Sandia Laboratories Contracts SAN 40-0463 and SAN 49-6126, published by School of Oceanography, Oregon State University, 40pp.


- Heath, GRoss & Jack Dymond (1981) Metalliferous-sediment deposition in time and space:  East Pacific Rise and Bauer Basin, northern nazca plate, in Nazca Plate:  Crustal Formation and Andean Convergence.  Geological Society of America, Memoir 154., 154, 175-197.


- Kulm, LD, TM Thornbourg, H Schrader, A Masias, JM Resig, L Johnson (1981) Late Cenozoic carbonates on the Peru continental margin:  Lithostratigraphy, biostratigraphy, and tectonic history, Geological Society of America Memoir , 154, 469-506.


- Loubere, Paul (1981) Properties of the Oceans Reflected in the Sea-bed Distribution of Quaternary Planktonic Forminifera:  including a study of the lmits of empirical paleo-oceanographic models and the recognition and interpretation of faunal assemblages lacking modern counterparts, pHD thesis, Oregon State University, 110pp.


- Lyle, Mitchell (1981) Formation and Growth of Ferromanganese Oxides on the Nazca Plate, in Nazca Plate:  Crustal Formation and Andean Convergence.  Geological Society of America, Memoir 154., 154, 269-293.


- McMurtry, GM, HH Veeh, and CMoser (1981) Sediment accumulation rate patterns on the northwest Nazca plate, in Nazca Plate:  Crustal Formation and Andean Convergence.  Geological Society of America, Memoir 154., 154, 211-250.


- Moore, Willard S, Kenneth Bruland and Jacqueline Michel (1981) Fluxes of uranium and thorium series isotopes in the Santa Barbara Basin, Earth and Planetary Science Letters, 53, 391-399.


- Resig, Johanna M (1981) Biogeography of benthic foraminifera of the northern Nazca plate and adjacent continental margin, in Nazca Plate:  Crustal Formation and Andean Convergence.  Geological Society of America, Memoir 154., 154, 619-666.


- Rosato, Victor J and LD Kulm (1981) Clay mineralogy of the Peru continental margin and adjacent Nazca plate:  Implications for provenance, sea level changes, and continental accretion, Geological Society of America Memoir , 154, 545-568.


- Schuette, Gretchen and Hans Schrader (1981) Diatoms in Surface Sediments:  A Reflection of Coastal Upwelling., Coastal Upwelling, Coastal and Estuarine Sciences 1 American Geophysical Union, 1, 372-380.


- Stakes, Debra & KF Scheidegger (1981) Temporal variations in secondary minerals from Nazca plate basalts, diabases, and microgabbros, in Nazca Plate:  Crustal Formation and Andean Convergence.  Geological Society of America, Memoir 154., 154, 109-130.


- Thornburg, Todd and LD Kulm (1981) Sedimentary basins of the Peru continental margin:  Structure, statigraphy, and Cenozoic tectonics from 6°S to 16°S latitude, Geological Society of America Memoir , 154, 393-422.


- Veeh, H Herbert (1981) Uranium and thorium isotopic investigations in metalliferous sediments of the northwestern Nazca plate, in Nazca Plate:  Crustal Formation and Andean Convergence.  Geological Society of America, Memoir 154., 154, 251-267.


- Cobler, Richard and Jack Dymond (1980) Sediment Trap Experiment on the Galapagos Spreading Center, Equatorial Pacific, Science, 209, 801-803.


- Heath, GR (1980) Low Level Waste Ocean Disposal Program.  Status of W-N Studies as of October 31, 1980.  Report OSU-7.  Sandia Laboratories Contract SAN 49-6126, published by School of Oceanography, Oregon State University, 15pp.


- Krissek, Lawrence A, KF Scheidegger, LD Kulm (1980) Surface sediments of the Peru-Chile continental margin and the Nazca plate, Geological Society of America Bulletin, 91, 321-331.


- Moore, Ted C, Jr, LH Burckle, K Geitzenauer, B Luz, A Molina-Curz, JH Robertson, H Sachs, C Sancetta, J Thiede, P Thompson, and C Wenkam  (1980) The Reconstruction of Sea Surface Temperatures in the Pacific Ocean of 18,000 B.P., Marine Micropaleontology, 5, 215-247.


- Schuette, Gretchen (1980) Recent Marine Diatom Taphocoenoses off Peru and off Southwest Aftrica:  Reflection of Coastal Upwelling, pHd Thesis, Oregon State University, 115 pp.


- Suess, E and PJ Muller (1980) Productivity, Sedimentation rate, and Sedimentary organic matter in the oceans II. Elemental Fractionation, Coll. Internationaux du C.N.R.S. Paris, France, 17-26.


- Suess, E, PJ Muller, HS Powell and CE Reimers (1980) A closer look at nitrification in pelagic sediments, Geochemical Journal, 14, 129-137.
`}</SemanticMDX>
	);
};

const PublicationsBefore1980: FunctionComponent = () => {
	return (
		<SemanticMDX>{`
The OSU-MGR has a long history of assisting with scientific research resulting in over 400 scientific publications. These are also listed  in a [Google Scholar Citation](https://scholar.google.com/citations?hl=en&user=x5lYe50AAAAJ&view_op=list_works) page. If you use our cores and publish the data on them then please drop us an email to keep this page updated!

- Corliss, John B, JDymond, LIGordon, etal (1979) Submarine Thermal Springs on the Galapagos Rift, Science, 203, 1073-1083.


- DeVries, Thomas J (1979) Nekton Remains, Diatoms, and Holocene Upwelling off Peru, MS thesis, Oregon State University, 85pp.


- Heath, GRoss and Nicklas G Pisias (1979) A Method for the Quantitative Estimation of Clay Minerals in North Pacific Deep-Sea Sediments, Clays and Clay Minerals, 27, 175-184.


- Heusser, Linda E and Nicholas J Shackleton (1979) Direct Marine-Continental Correlation:  150,000-Year Oxygen Isotope–Pollen Record from the North Pacific, Science, 204, 837-839.


- Hongve, Dag and Arne H Erlandsen (1979) Shortening of Surface Sediment Cores During Sampling, Hydrobiologia, 65, 283-287.


- Karlin, Robert (1979) Sediment Sources and Clay MIneral Distribution off the Oregon Coast:  Evidence for a Poleward Slope Undercurrent, MS Thesis, Oregon State University, 88pp.


- Kulm, LD and KF Scheidegger (1979) Quarternary Sedimentation on the Tectonically Active Oregon Continental Slope, SEPM Special Publication No.27, August 1979, 247-263.


- Moser, John Christian (1979) Sedimentation and Accumulation Rates of Nazca Plate Metalliferous Sediments by High Resoltn Ge(Li) Gamma-Ray Spectrometry of U-Series Isotopes., MS Thesis, Oregon State University, 65 pp.


- Muller, PJ and E Suess (1979) Productivity, sedimentation rate, and sedimentary organic matter in the oceans–I.  Organic carbon   preservation, Deep-Sea Research, 26A, 1347-1362.


- Sancetta, Constance (1979) Oceanography of the North Pacific During the Last 18,000 Years:  Evidence From Fossil Diatoms, Marine Micropaleontology, 4, 103-123.


- Stakes, Debra S (1979) Submarine Hydrothermal Systems: Variations in Mineralogy, Chemistry, Temperatures and the Alteration of Oceanic Layer II, pHd Thesis, Oregon State University, 189pp.


- Corliss, John B, Mitchell Lyle, and Jack Dymond (1978) The Chemistry of Hydrothermal Mounds near the Galapagos Rift, Earth and Planetary Science Letters, 40, 41997.


- Lyle, Mitchell (1978) The Formation and Growth of Ferromanganese oxides on the Nazca Plate, pHd thesis, Oregon State University, 172.


- Molina-Cruz, Adolfo (1978) Late Quaternary Oceanic Circulation Along the Pacific Coast of South America, pHd thesis, Oregon State University, 246pp.


- Pisias, Nicklas G (1978) Paleoceanography of the Santa Barbara Basin during the Last 8000 Years, Quaternary Research, 10, 366-384.


- Scheidegger, KF, LD Kulm, JB Corliss, WJ Schweller, RA Prince (1978) Fractionation and Mantle Heterogeneity in Basalts from the Peru-Chile Trench, Earth and Planetary Science Letters, 37, 409-420.


- Schweller, William J and LaVerne D Kulm (1978) Depositional Patterns and Channelized Sedimentation in Active Eastern Pacific Trenches, Sedimentation in Submarine Canyons, Fans and Trenches Eds. DJ Stanley and G. Kelling, 311-324.


- Schweller, William J and LD Kulm (1978) Extensional Rupture of Oceanic Crust in the Chile Trench, Marine Geology, 28, 271-291.


- Wakeham, Susan E (1978) Petrochemical Patterns in Young Pillow Basalts Dredged from Juan de Fuca and Gorda Ridges, MS Thesis, Oregon State University, 95 pp.


- Clark, James G, and Jack Dymond (1977) Geochronology and Petrochemistry of Easter and Sala Y Gomez Islands:  Implications for the Origin of the Sala Y Gomez Ridge, Journal of Volcanology and Geothermal Research, 2, 29-48.


- Dowding, Lynn (1977) Sediment Dispersal within the Cocos Gap, Panama Basin, Journal of Sedimentary Petrology, 47, 1132-1156.


- Graham, Rhea Lydia (1977) A Paleomagnetic Study of Recent Sediments in the Santa Barbara Basin, MS thesis, Oregon State University, 39 pp.


- Heath, G Ross and Jack Dymond (1977) Genesis and transformation of metalliferous sediments from the East Pacific Rise, Bauer Deep, and Central Basin northwest Nazca plate, Geological Society of America Bulletin, 88, 723-733.


- Heath, G Ross, Ted C Moore, Jr, and J Paul Dauphin (1977) Organic Carbon in Deep-Sea Sediments, in The Fate of Fossil Fuel CO2 in the Oceans, Andersen, Neil R. and Malahoff, Alexander, eds., Plenum Publishing Corp., 605-625.


- Heusser, Linda and William L Balsam (1977) Pollen Distribution in the Northeast Pacifc Ocean, Quaternary Research, 7, 45-62.


- Lyle, Mitchell, Jack Dymond, G Ross Heath (1977) Copper-Nickel-enriched Ferromanganese nodules and associated crusts from the Bauer basin, Northwest Nazca Plate, Earth and Planetary Science Letters, 35, 55-64.


- Molina-Cruz, Adolfo and Patricia Price (1977) Distribution of opal and quartz on the ocean florr of the subropical southeastern Pacific, Geology, 5, 81-84. doi: https://dx.doi.org/10.1130/0091-7613(1977)52.0.CO;2


- Moore, Ted C, Jr, NG Pisias, and GR Heath (1977) Climate Changes and Lags in Pacific Carbonate Preservation, Sea Surface Temperature and Global Ice Volume, in The Fate of Fossil Fuel CO2 in the Oceans, Andersen, Neil R. and Malahoff, Alexander, eds., Plenum Publishing Corp., 145-165.


- Scheidegger, KF & Debra S Stakes (1977) Mineralogy, Chemistry and Crystallization Sequence of Clay Minerals in Altered Tholeiitic Basalts from the Peru Trench, Earth and Planetary Science Letters, 36, 413-422.


- Selk, Bruce W (1977) The Manganese-enriched sediments of the Blanco trough:  Evidence for hydrothermal activity in a fracture zone., MS thesis, Oregon State University, 137 pp..


- Toth, John R (1977) Deposition of Submarine Hydrothermal Manganese and Iron and Evidence for Hydrothermal Input of Volatile Elements to the Ocean, Ms Thesis, Oregon State University, 79pp.


- Wenkam, Chiye (1977) Late Quaternary Changes in the Oceanography of the Eastern Tropical Pacific, MS thesis, Oregon State University, 143 pp.


- Dowding, Lynn G (1976) Sedimentation Within the Cocos Gap, Panama Basin, MS thesis, Oregon State University, 69 pp.


- Echegaray, Juan Antonio Masias (1976) Morphology, Shallow Structure and Evolution of the Peruvian Continental Margin 6° to 18°S, MS thesis, Oregon State University, 92 pp.


- Field, CW, JR Dymond, JB Corliss, EJ Dasch, GR Heath, RG Senechal (1976) Metallogenesis in Southeast Pacific Ocean: Nazca Plate Project, Circum-Pacific Energy and Mineral Resources The American Association of Petroleum Geologists, Memoir No. 25, 539-550.


- Heath, G Ross, TC Moore, Jr, and J Paul Dauphin (1976) Late Quaternary Accumulation rates of Opal, Quartz, Organic Carbon, and Calcium Carbonate in the Cascadia Basin Area, Northeast Pacific, Geological Society of America Memoir , 145, 393-409.


- Lyle, Mitchell W and Jack Dymond (1976) Metal Accumulation rates in the Southeast Pacific–Errors introduced from assumed bulk densities., Earth and Planetary Science Letters, 30, 164-168.


- Nelson, Hans (1976) Late Pleistocene and Holocene Depositional Trends, Processes, and History of Astoria Deep-Sea Fan, Northeast Pacific, Marine Geology, 20, 129-173.


- Schweller, William J (1976) Chile Trench:  Extensional Rupture of Oceanic Crust and the influence of Tectonics on Sediment Distribution, MS thesis, Oregon State University, 90 pp.


- Dymond, Jack and HH Veeh (1975) Metal Accumulation rates in the southeast Pacific and the Origin of Metalliferous Sediments, Earth and Planetary Science Letters, 28, 13-22.


- Florer-Heusser, Linda E (1975) Late-Cenozoic Marine Palynology of Noertheast Pacific Ocean Cores, Quaternary Studies R.P. Suggate, M.M. Cresswell, eds.  The Royal Society of New Zealand, Wellington, 133-138.


- Molina-Cruz, Adolfo (1975) Paleo-Oceanography of the Subtropical Southeastern Pacific during Late Quarternary:  A Study of Radiolaria, Opal and Quartz Contents of Deep-Sea Sediments, MS Thesis, Oregon State University,


- Prince, Roger A, and LD Kulm (1975) Crustal rupture and the initiation of imbricate thrusting in the Peru-Chile Trench, Geological Society of America Bulletin, 86, 1639-1653.


- Heath, G Ross, TC Moore, Jr, and G Louis Roberts (1974) Mineralogy of Surface Sediments from the Panama Basin, Eastern Equatorial Pacific, Journal of Geology, 82, 145-160.


- Holmes, ML and JS Creager (1974) Holocene History of the Laptev Sea Continental Shelf, in Marine Geology and Oceanography of the Arctic Seas, Yvonne Rosenberg-Herman, ed., 211-229.


- Kendrick, John William (1974) Trace Element Studies of Metalliferous Sediments in Cores from the East Pacific Rise and Bauer Deep, 10°S, MS Thesis, Oregon State University,


- Knebel, Harley J, Joe S Creager, & Ronald J Echols (1974) Holocene Sedimentary Framework, East-Central Bering Sea Continental Shelf, in Marine Geology and Oceanography of the Arctic Seas, Yvonne Rosenberg-Herman, ed., 157-172.


- Kulm, LD, JM Resig, TC Moore, VJ Rosato (1974) Transfer of Nazca Ridge Pelagic Sediments to the Peru Continental Margin, Geological Society of America Bulletin, 85, 767-780.


- Malfait, Bruce Terry (1974) The Carnegie Ridge Near 86deg W.:  Structure, Sedimentation, and Near Bottom Observations, pHd Thesis, Oregon State University, 131 pp.


- Naugler, Frederic P, Norman Silverberg, and Joe s Creager (1974) Recent Sediments of the East Siberian Sea, in Marine Geology and Oceanography of the Arctic Seas, Yvonne Rosenberg-Herman, ed., 191-210.


- Phipps, James Benjamin (1974) Sediments and tectonics of the Gorda-Juan de Fuca Plate, pHd Thesis, Oregon State University, 118pp.


- Prince, RA, JM Resig, LD Kulm, TC Moore, Jr (1974) Uplifted Turbidite Basins on the Seaward Wall of the Peru Trench, Geology, 2, 607-611.


- Rosato, Victor J (1974) Peruvian Deep-Sea Sediments:  Evidence for Continental Accretion, MS Thesis, Oregon State University, 93 pp.


- Yamashiro, Chiye (1974) Differentiating Dissolution and Transport Effects in Foraminiferal Sediments from the Panama Basin, Dissolution of Deep-Sea Carbonates Special Publication No.13, Cushman Foundation for Foraminiferal Research, USA,


- Heath, GR and J Dymond (1973) Interstitial Silica in Deep-Sea Sediments from the North Pacific, Geology, 181-184.


- Kowsmann, Renato Oscar (1973) Surface Sediments of the Panama Basin: Coarse Components, MS Thesis, Oregon State University,


- Kowsmann, Renato Oscar (1973) Coarse Components in Surface Sediments of the Panama Basin, Eastern Equatorial Pacific, Journal of Geology, 81, 473-494.


- Kulm, LD, KF Scheidegger, RA Prince, J Dymond, TC Moore, JR, DM Hussong (1973) Tholeiitic Basalt Ridge in the Peru Trench, Geology, 1, 41957.


- Moore, TC, GR Heath and RO Kowsmann (1973) Biogenic Sediments of the Panama Basin, Journal of Geology, 81, 458-472.


- Moore, Ted C, Jr (1973) Late Pleistocene-Holocene Oceanographic Changes in the Northeastern Pacific, Journal of Quarternary Research, 3, 99-109.


- vanAndel, Tjeerd H (1973) Texture and Dispersal of Sediments in the Panama Basin, Journal of Geology, 81, 434-457.


- Ellis, David Burl (1972) Holocene Sediments of the South Atlantic Ocean:  The Calcite Compensation Depth and Concentrations of Calcite, Opal and Quartz, MS Thesis, Oregon State University,


- Carson, Bobb (1971) Stratigraphy and Depositional History of Quaternary Sediments in Northern Cascadia Basin and Juan de Fuca Abyssal Plain, Northeast Pacific Ocean, pHd thesis, University of Washington,


- Fowler, GA, WN Orr, and LD Kulm (1971) An Upper Miocene Diatomaceous Rock Unit on the Oregon Continental Shelf , The Journal of Geology, 79, 603-608.


- Kummer, John T and Joe S Creager (1971) Marine Geology and Cenozoic History of the Gulf of Anadyr, Marine Geology, 10, 257-280.


- Muehlberg, GE (1971) Structure and Stratigraphy of Tertiary and Quaternary Strata, Heceta Bank, Central Oregon Shelf, MS thesis, Oregon State University, 78pp.


- Spigai, JJ (1971) Marine Geology of the Continental Margin off Southern Oregon, pHD thesis, Oregon State University, 214pp.


- Fowler, GA and LD Kulm (1970) Foraminiferal and Sedimentological Evidence for Uplift of the Deep-sea Floor, Gorda Rise, Northeastern Pacific, Journal of Marine Research, 28, 321-329.


- Roush, RC (1970) Sediment Textures and Internal Structures:  A Comparison Betweem Central Oregon Continental Shelf Sediments and Adjacent Coastal Sediments, MS Thesis, Oregon State University, 75pp.


- Carlson, Paul R and C Hans Nelson (1969) Sediments and Sedimentary Structures of the Astoria Submarine Canyon-Fan System, Northeast Pacific, Journal of Sedimentary Petrology, 39 (4), 1269-1282.


- Chambers, DM (1969) Holocene Sedimentation and Potential placer deposits on the Continental Shelf off the Rogue River, Oregon, MS thesis, Oregon State University, 103pp.


- Griggs, GB (1969) Cascadia Channel: the anatomy of a Deep-Sea Channel, phD thesis, Oregon State University, 183pp.


- Peterson, RE (1969) Calcium Carbonate, Organic Carbon, and Quartz in Hemipelagic Sediments off Oregon:  A Preliminary Investigation, MS Thesis, Oregon State University, 44pp.


- Duncan, JR (1968) Late Pleistocene and Postglacial Sedimentation and Stratigraphy of Deep-Sea Environments off Oregon, pHd thesis, Oregon State University, 222pg.


- Nelson, CH (1968) Marine Geology of Astoria Deep-Sea Fan, pHd thesis, Oregon State University, 287 pp.


- Nelson, CH, LD Kulm, PR Carlson, and JR Duncan (1968) Mazama Ash in the Northeastern Pacific, Science, 161, 47-49.


- Boettcher, RS (1967) Foraminiferal Trends of the Central Oregon Shelf, MS thesis, Oregon State University, 134 pp.


- Carlson, PR (1967) Marine Geology of Astoria Submarine Canyon, pHd Thesis, Oregon State University, 259 pp.


- Runge, EJ (1966) Continental Shelf Sediments, Columbia River to Cape Blanco, Oregon, pHd Thesis, Oregon State University, 143pp.


- Emery, KO and J Hulsemann (1964) Shortening of Sediment Cores Collected in Open Barrel Gravity Cores, Sedimentology, 3, 144-154.


- Bushnell, DC (1963) Continental Shelf Sediments in the Vicinity of Newport, Oregon, MS thesis, Oregon State University, 107 pp.
`}</SemanticMDX>
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
		'/parking': Parking,
		'/staff': Staff,
		'/oversight-committee': OversightCommittee,
		'/policies': Policies,
		'/virtual-tour': VirtualTour,
		'/facility-history': FacilityHistory,
		'/services': Services,
		'/request-samples': RequestSamples,
		'/core-distribution-guidelines': CoreDistributionGuidelines,
		'/dredge-distribution-guidelines': DredgeDistributionGuidelines,
		'/sedct': SedCT,
		'/corelyzer': CoreLyzer,
		'/education-outreach': EducationOutreach,
		'/2017-meeting-of-the-curators-of-marine-lacustrine-and-geological-samples': CuratorsMeeting2017,
		'/publications': Publications,
		'/publications-2010-to-2019': Publications2010to2019,
		'/publications-2000-to-2009': Publications2000to2009,
		'/publications-1990-to-1999': Publications1990to1999,
		'/publications-1980-to-1989': Publications1980to1989,
		'/publications-before-1980': PublicationsBefore1980,
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
				<Menu secondary pointing stackable>
					{navSiblings.map((sibling) => (
						<Menu.Item
							key={sibling.id}
							as='a'
							href={sibling.link}
							active={sibling.link === path}
						>
							{sibling.text}
						</Menu.Item>
					))}
				</Menu>
			)}
			{tempPages[path] && tempPages[path]()}
			{!tempPages[path] && pagesData.pages && pagesData.pages[path] && (
				<>{path}</>
			)}
			{!tempPages[path] && (!pagesData.pages || !pagesData.pages[path]) && (
				<Container style={{ display: 'flex', height: '50vh' }}>
					<Message
						error
						size='large'
						icon='warning'
						header='Error 404'
						content='This page is not found.'
						style={{ margin: 'auto', width: 'auto' }}
					/>
				</Container>
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
