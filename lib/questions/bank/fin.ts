/* Finance prompts. Data only. The format is described in lib/questions/index.ts. */
import type { Question } from "@/types";

export const FIN: Question[] = [
// ---------------- Finance ----------------
{id:'FIN-01',cluster:'fin',topic:'Finance',area:'Financial Analysis',diff:1,q:'Name a type of investment.',
 why:'Investments range from ownership (stocks) and lending (bonds) to pooled funds and real assets. A REIT lets investors own shares of income-producing property.',
 a:[['Stocks',1,'shares','equities','equity'],['Bonds',1,'corporate bonds'],['Real estate',2,'property'],['Mutual funds',2],['Cryptocurrency',2,'crypto','bitcoin'],['ETFs',3,'etf','exchange traded funds'],['Index funds',3],
 ['Certificates of deposit',3,'cd','cds','certificate of deposit'],['Commodities',4,'gold'],['Treasury bills',4,'t bills','treasuries','treasury bonds','government bonds'],['Options',4,'derivatives','futures'],['Money market account',5,'money market','money market fund'],['Collectibles',5,'art'],['Annuities',6,'annuity'],['REITs',6,'reit','real estate investment trust']]},
{id:'FIN-02',cluster:'fin',topic:'Finance',area:'Financial Analysis',diff:3,q:'Name a financial ratio.',
 why:'Ratios turn statements into comparisons. Interest coverage shows how many times operating earnings cover interest payments.',
 a:[['Return on investment',1,'roi'],['Profit margin',1,'net profit margin','gross margin','gross profit margin','net margin'],['Price-to-earnings ratio',2,'p e','pe ratio','price to earnings','price earnings'],['Current ratio',2],['Debt-to-equity ratio',2,'debt to equity','debt equity'],
 ['Return on equity',3,'roe'],['Earnings per share',3,'eps'],['Quick ratio',4,'acid test','acid test ratio'],['Return on assets',4,'roa'],['Debt ratio',4,'debt to assets'],['Inventory turnover',5],['Asset turnover',5],['Interest coverage ratio',6,'interest coverage','times interest earned']]},
{id:'FIN-03',cluster:'fin',topic:'Finance',area:'Financial Analysis',diff:1,q:'Name a type of financial institution.',
 why:'Financial institutions move money between savers and borrowers. Pension funds are among the largest institutional investors.',
 a:[['Bank',1,'commercial bank','retail bank'],['Credit union',2],['Investment bank',3],['Insurance company',3,'insurer'],['Brokerage',3,'brokerage firm','stock broker'],['Savings and loan',4,'thrift','savings and loan association','savings bank'],
 ['Central bank',4,'federal reserve','fed'],['Hedge fund',4],['Venture capital firm',4,'venture capital'],['Private equity firm',5,'private equity'],['Payday lender',5],['Pension fund',6]]},
// ---------------- Personal Financial Literacy ----------------
{id:'PFL-01',cluster:'fin',topic:'Personal Financial Literacy',area:'Financial Analysis',diff:1,q:'Name a type of insurance.',
 why:'Insurance transfers the cost of a loss to an insurer. An umbrella policy adds liability coverage above the limits of home and auto policies.',
 a:[['Health insurance',1,'health','medical'],['Auto insurance',1,'car','car insurance','auto'],['Life insurance',2,'life'],['Homeowners insurance',2,'home','home insurance','homeowners'],['Renters insurance',3,'renters'],['Dental insurance',3,'dental'],['Vision insurance',3,'vision'],
 ['Disability insurance',4,'disability'],['Liability insurance',4,'liability'],['Pet insurance',4,'pet'],['Travel insurance',4,'travel'],['Flood insurance',5,'flood'],['Long-term care insurance',5,'long term care'],['Workers compensation',5,'workers comp'],['Umbrella insurance',6,'umbrella','umbrella policy'],['Title insurance',6,'title']]},
{id:'PFL-02',cluster:'fin',topic:'Personal Financial Literacy',area:'Financial Analysis',diff:2,q:'Name a factor that goes into a credit score.',
 why:'Scoring models weigh payment history most, then how much of your available credit you use. Credit mix, the variety of account types, is the factor people forget.',
 a:[['Payment history',1,'paying on time','on time payments','late payments'],['Credit utilization',2,'amounts owed','debt','utilization','amount owed'],['Length of credit history',4,'credit age','credit history length','age of credit','credit history'],['New credit',5,'hard inquiries','inquiries','credit inquiries'],['Credit mix',6,'types of credit','mix of credit']]},
{id:'PFL-03',cluster:'fin',topic:'Personal Financial Literacy',area:'Financial Analysis',diff:2,q:'Name a line you would find on a pay stub.',
 why:'A pay stub shows gross pay, each deduction, and net pay. A garnishment is a court-ordered deduction sent to a creditor.',
 a:[['Federal income tax',1,'income tax','taxes','federal tax','federal withholding'],['Gross pay',2,'gross income','gross'],['Net pay',2,'take home pay','net income','net'],['Social Security',2],['Medicare',3],['State income tax',3,'state tax'],['Health insurance',3,'insurance','medical insurance'],
 ['401(k) contribution',3,'401k','retirement','retirement contribution'],['FICA',4],['Overtime',4,'overtime pay'],['Hours worked',4,'hours'],['Year-to-date totals',5,'ytd','year to date'],['Union dues',5],['Health savings account',5,'hsa','fsa'],['Garnishment',6,'wage garnishment']]},
// ---------------- Accounting ----------------
{id:'ACC-01',cluster:'fin',topic:'Accounting',area:'Financial Analysis',diff:2,q:'Name a line on an income statement.',
 why:'The income statement runs from revenue down to net income. Depreciation spreads the cost of an asset across the years it is used.',
 a:[['Revenue',1,'sales','net sales','income'],['Net income',1,'profit','net profit','bottom line'],['Expenses',2,'operating expenses'],['Cost of goods sold',3,'cogs','cost of sales'],['Gross profit',3,'gross margin'],
 ['Taxes',4,'income tax','tax expense','tax'],['Operating income',4,'ebit','operating profit'],['Interest expense',5,'interest'],['Earnings per share',5,'eps'],['EBITDA',5],['Depreciation',6,'amortization']]},
{id:'ACC-02',cluster:'fin',topic:'Accounting',area:'Financial Analysis',diff:2,q:'Name an item on a balance sheet.',
 why:'A balance sheet lists what a business owns, what it owes and the owners\' stake. Deferred revenue is cash received for work not yet delivered, so it is a liability.',
 a:[['Cash',1],['Assets',1,'total assets'],['Liabilities',1,'total liabilities','debt'],['Accounts receivable',2,'receivables'],['Inventory',2],['Accounts payable',2,'payables'],['Equipment',3,'property plant and equipment','ppe'],["Owner's equity",3,'equity','stockholders equity','shareholders equity','owners equity'],
 ['Long-term debt',3,'loans','loans payable'],['Retained earnings',4],['Notes payable',4],['Common stock',4],['Land',4,'buildings'],['Prepaid expenses',5],['Goodwill',5],['Accrued liabilities',5,'accrued expenses'],['Accumulated depreciation',6],['Deferred revenue',6,'unearned revenue']]},
{id:'ACC-03',cluster:'fin',topic:'Accounting',area:'Financial Analysis',diff:3,q:'Name a step in the accounting cycle.',
 why:'The cycle turns transactions into statements each period. The post-closing trial balance is the last check that the books balance before the next period.',
 a:[['Journalize transactions',1,'journal entries','record transactions','journalizing','journal'],['Prepare financial statements',1,'financial statements'],['Post to the ledger',2,'posting','ledger','post to ledger'],['Trial balance',2,'unadjusted trial balance'],
 ['Analyze transactions',3,'identify transactions','analyzing transactions'],['Adjusting entries',3,'adjustments'],['Closing entries',4,'close the books','closing'],['Adjusted trial balance',5],['Worksheet',5],['Post-closing trial balance',6,'post closing trial balance'],['Reversing entries',6]]},
];
