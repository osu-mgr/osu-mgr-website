import numeral from 'numeral';

export const itemTypes = [
  'cruise',
  'core',
  'section',
  'sectionHalf',
  'sectionSample',
  'dive',
  'diveSample',
  'diveSubsample',
];

export type ItemType = typeof itemTypes[number];

export const itemTypesSingular: Record<ItemType, string> = {
  cruise: 'Cruise/Program',
  core: 'Core',
  section: 'Section',
  sectionHalf: 'Section Half',
  sectionSample: 'Section Sample',
  dive: 'Dive',
  diveSample: 'Dive Sample',
  diveSubsample: 'Dive Subsample',
};

export const itemTypesPlural: Record<ItemType, string> = {
  cruise: 'Cruises/Programs',
  core: 'Cores',
  section: 'Sections',
  sectionHalf: 'Section Halves',
  sectionSample: 'Section Samples',
  dive: 'Dives',
  diveSample: 'Dive Samples',
  diveSubsample: 'Dive Subsamples',
};

export const itemTypesHierarchy: Record<ItemType, ItemType[]> = {
  cruise: ['core', 'dive'],
  core: ['section'],
  section: ['sectionHalf'],
  sectionHalf: ['sectionSample'],
  sectionSample: [],
  dive: ['diveSample'],
  diveSample: ['diveSubsample'],
  diveSubsample: [],
};

export const itemFieldNames = {
  '_osuid.substring': 'OSU ID',
  '_errors.substring': 'Error',
  '_warnings.substring': 'Warning',
  'method.substring': 'Method',
  'latitudeEnd.substring': 'Latitude End',
  'latitudeStart.substring': 'Latitude Start',
  'longitudeEnd.substring': 'Longitude End',
  'longitudeStart.substring': 'Longitude Start',
  'material.substring': 'Material',
  'name.substring': 'Name',
  'length.substring': 'Length cm',
  'alternateName.substring': 'Alternate Name',
  'area.substring': 'Area',
  'collection.substring': 'Collection',
  'core.substring': 'Core',
  'cruise.substring': 'Cruise',
  'depthBottom.substring': 'Depth Bottom (cm)',
  'depthTop.substring': 'Depth Top (cm)',
  'diameter.substring': 'Diameter (cm)',
  'dive.substring': 'Dive',
//  'startDate.substring': 'Date Start',
//  'startTime.substring': 'Time Start',
//  'endDate.substring': 'Date End',
//  'endTime.substring': 'Time End',
//  'id.substring': 'ID',
  'igsn.substring': 'IGSN',
  'pi.substring': 'PI',
  'piEmail.substring': 'PI Email',
  'piInstitution.substring': 'PI Institution',
  'place.substring': 'Place',
  'rvName.substring': 'RV Name',
  'r2rCruiseID.substring': 'R2R Cruise ID',
  'sample.substring': 'Sample',
  'section.substring': 'Section',
  'texture.substring': 'Texture',
  'type.substring': 'Type',
  'waterDepthEnd.substring': 'Water Depth End (mbsl)',
  'waterDepthStart.substring': 'Water Depth Start (mbsl)',
  'weight.substring': 'Weight (kg)',
  'storageLocation.substring': 'Storage Location',
  'notes.substring': 'Notes',
};

export const formatField = (obj: Record<string, string>, fieldName: string): string => {
  if (fieldName === 'weight.substring')
    return numeral(obj[fieldName.replace('.substring', '')]).format('0,0.0')
  if (fieldName === 'latitudeStart.substring' ||
    fieldName === 'latitudeEnd.substring' ||
    fieldName === 'longitudeStart.substring' ||
    fieldName === 'longitudeEnd.substring')
    return numeral(obj[fieldName.replace('.substring', '')]).format('0,0.0000')
  return obj[fieldName.replace('.substring', '')] || '';
}