/**
 * Mock form data for development environment testing
 *
 * Purpose: Provide complete test data covering all conditional branches and non-required fields
 * - All L3 conditional branches activated to show maximum fields
 * - All repeatable groups filled (1 entry each)
 * - Non-required fields also populated for full preview testing
 */

export const mockFormData = {
  formData: {
    // Group 1: Basic Info
    lastName: 'Zhang',
    firstName: 'Wei',
    formerName: 'Li',              // non-required: 曾用名
    gender: 'male',
    dateOfBirth: '1990-05-15',
    phoneCountryCode: 'CN',
    phoneCountryCodeOther: '',
    phone: '13800138000',
    email: 'zhang.wei@example.com',

    // Group 2: Passport & ID
    passportNumber: 'E12345678',
    passportIssueDate: '2020-03-10',
    passportExpiryDate: '2030-03-09',
    issuingAuthority: 'CN',
    nationality: 'CN',
    nationalityOther: '',
    isFirstPassport: 'no',
    hasOtherPassport: 'yes',
    otherPassportCountry: 'US',
    otherPassportDetail: 'US passport, no. 12345678',
    idCardNumber: '110101199005150011',
    idCardAuthority: 'Beijing Municipal Public Security Bureau',
    idCardExpiry: '2030-05-14',

    // Group 3: Address
    currentCountry: 'CN',
    currentAddress: 'Room 101, Building 2, Chaoyang District, Beijing',
    postalCode: '100020',
    housingStatus: 'tenant',
    residenceStartDate: '2018-06-01',
    houseOwner: 'Mr. Wang Lei',

    // Group 4: Marriage & Spouse
    maritalStatus: 'married',
    spouseName: 'Li Na',
    spouseDob: '1992-08-22',
    spouseNationality: 'CN',
    spouseChangedNationality: 'yes',      // L3: 触发配偶其他国籍字段
    spouseOtherNationality: 'US',         // non-required: 配偶其他国籍
    spouseBirthCity: 'Shanghai',
    spouseCountry: 'CN',
    spouseAddress: 'Room 101, Building 2, Chaoyang District, Beijing',

    // Group 5: Parents
    father_name: 'Zhang Guoqiang',
    father_nationality: 'CN',
    father_changed_nationality: 'yes',    // L3: 触发父亲其他国籍字段
    father_other_nationality: 'US',       // non-required: 父亲其他国籍
    father_dob: '1965-03-10',
    father_going_to_uk: 'no',
    father_country: 'CN',
    father_address: 'No. 10 Haidian Road, Beijing',
    mother_name: 'Chen Xiaomei',
    mother_nationality: 'CN',
    mother_changed_nationality: 'yes',    // L3: 触发母亲其他国籍字段
    mother_other_nationality: 'US',       // non-required: 母亲其他国籍
    mother_dob: '1967-07-18',
    mother_going_to_uk: 'no',
    mother_country: 'CN',
    mother_address: 'No. 10 Haidian Road, Beijing',

    // Group 6: Children
    hasChildren: 'yes',

    // Group 7: Travel Plan
    purposeOfVisit: 'tourism',
    intendedArrivalDate: '2026-08-15',
    intendedDepartureDate: '2026-08-30',
    travelPlanDesc: 'Visit London, Edinburgh, and Lake District for sightseeing. Plan to stay 2 days in London, 3 days in Edinburgh, and 2 days in Lake District.',

    // Group 8: Companions
    hasCompanion: 'yes',

    // Group 9: Employment
    employmentStatus: 'working',
    jobStartDate: '2015-07-01',
    companyName: 'Beijing Tech Solutions Ltd.',
    companyAddress: 'Floor 10, Tower A, Zhongguancun Software Park',
    companyPostalCode: '100193',
    companyPhone: '+86-10-88889999',
    jobTitle: 'Senior Software Engineer',
    jobDuties: 'Lead backend development team, design system architecture',
    monthlySalary: 35000,
    otherIncome: 'Investment income: 5000 CNY/month',
    unemployedReason: '',

    // Group 10: Financial
    estimatedUKSpend: 50000,
    monthlyExpense: 15000,
    hasSponsor: 'yes',                    // L3: 触发赞助人字段
    sponsorName: 'Zhang Guoqiang',        // non-required: 赞助人姓名
    sponsorRelation: 'father',            // non-required: 赞助人关系
    sponsorAmount: 20000,                 // non-required: 赞助金额

    // Group 11: UK Contacts & Accommodation
    hasUKContact: 'yes',
    ukContactName: 'John Smith',
    ukContactStatus: 'citizen',
    ukContactDocNumber: 'AB123456',
    ukContactRelation: 'friend',
    ukContactPhone: '+44-20-12345678',
    ukContactPostal: '10 Downing Street, London, SW1A 2AA',
    hasUKAccommodation: 'yes',
    ukAccommodationDetail: 'Hotel',
    ukAccommodationCountry: 'GB',
    ukAccommodationAddress: 'The Ritz London, 150 Piccadilly, St. James',
    ukAccommodationPostal: 'W1J 9BR',
    ukCheckinDate: '2026-08-15',
    ukCheckoutDate: '2026-08-30',

    // Group 12: Visa & Travel History
    hadUKVisa: 'yes',
    lastUKVisaDate: '2019-06',
    visitedUK: 'yes',
    beenRefused: 'yes',                   // L3: 触发拒签记录
    appliedUKStay: 'yes',
    applyDetail_date: '2019-05-15',
    applyDetail_reason: 'Tourism',
    applyDetail_approved: 'yes',
    visitedOtherCountries: 'yes',         // L3: 触发其他国家旅行记录

    // Group 13: Security & Background
    hasUKInsurance: 'yes',
    insuranceNumber: 'UKINS-2026-001234',
    insuranceReason: 'Travel medical insurance covering UK stay',
    hasCriminalRecord: 'no',
    hasTerrorism: 'no',
    hasBeenProsecuted: 'no',
    hasGenocide: 'no',
    hasArmedConflict: 'no',
    hasSpecialIndustry: 'yes',
    specialIndustries: 'government',
    specialIndustryDetail: 'Work in government-affiliated technology research institute',
  },
  companions: [
    {
      name: 'Li Na',
      dob: '1992-08-22',
      nationality: 'CN',
      otherNationality: '',
      passport: 'E87654321',
      relation: 'spouse',
    },
  ],
  children: [
    {
      name: 'Zhang Mingyu',
      nationality: 'CN',
      changedNationality: 'no',
      otherNationality: '',
      relation: 'son',
      dob: '2020-01-15',
      goingToUK: 'no',
      country: 'CN',
      address: 'No. 10 Haidian Road, Beijing',  // non-required: 子女地址
    },
  ],
  ukVisits: [
    {
      date: '2019-06',
      duration: '14',
      purpose: 'Tourism',
    },
  ],
  refusals: [
    {
      date: '2018-03',
      country: 'US',
      reason: 'Incomplete documentation',
      refNumber: 'US-REF-2018-001',
    },
  ],
  otherCountries: [
    {
      name: 'US',
      date: '2023-04',
      duration: '7',
      purpose: 'Tourism',
    },
  ],
}
