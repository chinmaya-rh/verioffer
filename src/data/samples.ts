export interface SampleCase {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  category: 'job' | 'rental' | 'internship' | 'crypto';
  senderDomain: string;
  text: string;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'high-risk-equipment-scam',
    title: '⚡ High-Risk Scam Sample (Equipment & Check Fraud)',
    subtitle: 'Classic remote job check cashing & fake vendor equipment scam',
    badge: 'CRITICAL (96%)',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    category: 'job',
    senderDomain: 'recruitment@apexhealth-careers-hr.com',
    text: `Subject: URGENT: OFFICIAL APPOINTMENT LETTER & REMOTE ONBOARDING DIRECTIVE - APEX HEALTH SOLUTIONS INC.

Dear Candidate,

Following your brief review via Telegram messaging, the Executive Hiring Board of Apex Health Solutions Inc. has unanimously approved your appointment as Senior Remote Operations & Data Analyst.

COMPENSATION & WORKING CONDITIONS:
- Hourly Pay: $68.50/hour (Paid bi-weekly via Direct Deposit or Check)
- Hours: 35 Hours weekly, flexible remote scheduling
- Sign-on Incentive: $2,500 after 14 business days

EQUIPMENT PROCUREMENT PROTOCOL - MANDATORY STEP:
To ensure HIPAA encryption protocols, you are strictly prohibited from using personal equipment. Our financial clearing department is issuing you a guaranteed Cashier's Certified Check in the amount of $4,850.00. 

UPON RECEIPT OF THE CHECK:
1. Deposit the check via your mobile banking app immediately within 12 hours.
2. Deduct $350 as your first week orientation advance.
3. Wire the remaining balance ($4,500.00) immediately via Zelle, Apple Pay, or Bitcoin ATM to our accredited internal vendor:
   - Vendor Name: Global Tech Office Logistics LLC
   - Wire Reference: ATX-WORKSTATION-SECURE-992
   - Contact Person: logistics.clearance@proton.me

Failure to finalize equipment procurement within 24 hours will forfeit your appointment and result in legal reporting for breach of contract. Please sign below and upload front/back photo of your Social Security Card and State ID immediately.

Sincerely,
Dr. Robert Vance, HR Executive Vice President
Apex Health Careers (apexhealth-careers-hr.com)`,
  },
  {
    id: 'legitimate-corporate-offer',
    title: '🏢 Verified Enterprise Offer (Google / Alphabet Inc.)',
    subtitle: 'Standard, professional employment agreement with no upfront demands',
    badge: 'LOW RISK (5%)',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    category: 'job',
    senderDomain: 'careers.google.com',
    text: `Subject: Formal Offer of Employment: Software Engineer III - Google LLC

Dear Candidate,

On behalf of Google LLC, I am delighted to extend to you a formal offer of employment for the position of Software Engineer III within Core Systems Infrastructure, reporting to Mountain View, CA (Hybrid model).

KEY TERMS OF EMPLOYMENT:
- Annual Base Salary: $178,000.00 USD, annualized and paid semi-monthly.
- Equity Incentive: Target grant value of $160,000 in Alphabet Class C Restricted Stock Units (GSUs), vesting over a standard 4-year schedule.
- Sign-On Bonus: $25,000.00, payable on your first standard payroll cycle.
- Benefits: Full comprehensive medical, dental, vision coverage, 401(k) matching up to 50% on eligible contributions, and 20 days paid vacation annually.

CONTINGENCIES & NEXT STEPS:
This offer is contingent upon successful completion of a routine background check conducted by our certified third-party vendor, Sterling Infosystems. Google will never ask you to pay any fee for background verification, application processing, or equipment. All required enterprise hardware (pre-configured Google Pixelbook/MacBook, YubiKeys, monitors) will be shipped directly to your residential address at zero cost to you by Google Internal IT Logistics.

Please review the full terms via our secure candidate portal at https://careers.google.com/dashboard using your single sign-on authentication by September 28.

Warm regards,
Sarah Jenkins
Senior Staff Technical Recruiter | Google People Operations
sarahjenkins@google.com`,
  },
  {
    id: 'rental-deposit-scam',
    title: '🏠 Fraudulent Rental Deposit Scam (Overseas Landlord)',
    subtitle: 'Too-good-to-be-true apartment deal with urgent wire request',
    badge: 'CRITICAL (92%)',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    category: 'rental',
    senderDomain: 'apartments-luxury-rentals.xyz',
    text: `Hello Prospective Tenant,

Thank you for your inquiry regarding the 2-Bedroom / 2-Bathroom Penthouse at 450 North Michigan Ave. The rent is $1,100 per month including all utilities (water, gas, electricity, high-speed fiber internet, and 2 garage parking spaces).

Reason for this low price: My wife and I just relocated to West Africa for a 4-year missionary project with Doctors Without Borders. We are not interested in making huge profits, only looking for a clean, God-fearing person who will take good care of the home.

You cannot view the interior in person right now because the previous keys are with me here in Cameroon. However, you can drive by the building and look through the windows. 

If you like what you see, you must wire the refundable security deposit ($1,100) + first month rent ($1,100) = $2,200 via Chime, CashApp ($DrMarkMission), or Western Union. Once the payment clears, I will express mail the keys and original lease documents via FedEx overnight with tracking number. 

There are 5 other interested applicants waiting, so please confirm payment within 6 hours to lock in the lease.

Blessings,
Rev. Dr. Mark Williams
mark.williams.rentals44@yahoo.com`,
  },
  {
    id: 'telegram-crypto-task-scam',
    title: '📱 WhatsApp / Telegram App-Rating Scam',
    subtitle: 'Pig-butchering task fraud with fake commission recharges',
    badge: 'HIGH RISK (88%)',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    category: 'crypto',
    senderDomain: 'cloud-app-optimization.top',
    text: `Hi! I am Chloe from Digital Media Global HR. We noticed your resume on LinkedIn and are pleased to invite you for a flexible part-time remote position.

JOB DESCRIPTION:
Help mobile app developers boost their Google Play and Apple App Store ratings by optimizing 38 app reviews per daily cycle. 

SALARY & COMMISSION:
- Basic daily salary: 150 USDT - 400 USDT
- Time commitment: 30 to 60 minutes per day
- Withdrawal: Instant payout to any TRC20 crypto wallet

REQUIREMENTS:
1. Contact our mentor on Telegram: @GlobalTaskOptim_Manager
2. Register an account on our platform: http://app-boost-cloud88.top
3. You will receive 20 USDT trial bonus. Note: During "Combination Lucky Tasks", your workbench account balance may become negative. You will need to deposit matching USDT to unfreeze your commission and withdraw the guaranteed 300% profit.

Reply "START" to begin right away!`,
  },
];
