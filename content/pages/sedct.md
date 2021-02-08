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