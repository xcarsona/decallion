# Question review

Every prompt added in the career-cluster rebuild is listed here so a person can review the content. The answer boards themselves are in `lib/questions/bank/`, one file per cluster.

Each new prompt was written by one AI agent, fact-checked by a second and play-tested by a third. None has been reviewed by a person or checked against a textbook, and the answer levels are editorial estimates. Nothing here claims to map to official DECA performance indicators.

## Counts

| Cluster | Prompts | Original | New | Topics |
|---|---|---|---|---|
| Business Management + Administration (`bma`) | 36 | 15 | 21 | 8 |
| Entrepreneurship (`ent`) | 37 | 3 | 34 | 7 |
| Finance (`fin`) | 37 | 9 | 28 | 7 |
| Hospitality + Tourism (`ht`) | 37 | 3 | 34 | 6 |
| Marketing (`mkt`) | 37 | 9 | 28 | 7 |
| **Total** | **184** | **39** | **145** | |

## Points the reviewing agents flagged for a person to decide

These are judgment calls the fact-checker or play-tester left in place and noted. They are the best place to start.

### Business Management + Administration

- POB-04 / SBM-05: I deleted the bma copy because I may only edit bma.ts. If the ent fact-checker also deletes SBM-05, neither cluster will have a general business-risk prompt and one should be restored.
- BMA-04: 'Theory X and Theory Y' (aliases 'theory x', 'theory y') and 'Theory Z' are separate rows one character apart. Exact matches resolve correctly, but a typo such as 'theory c' lands on the X/Y row. This is inherent to the content, so I left it.
- BMA-04: the area is 'Human Resources Management' under the topic Business Management. That is defensible for motivation theories, but 'Strategic Management' or 'Emotional Intelligence' may suit the owner better.
- ECO-04: 'Water and sewer service' (aliases water, sewer, trash collection) is kept, but these are often paid for by user fees, not taxes. Remove the row if the owner wants strictness.
- ECO-06: the prompt accepts shifters of either the demand or the supply curve on one board. Everything on it is a correct shifter of one curve, but splitting it into two prompts would teach more.
- HRM-03: 'Sexual orientation' and 'Gender identity' are protected under Title VII through the 2020 Bostock decision, and 'Citizenship status' through the Immigration Reform and Control Act. They are correct but come from case law or a less-taught statute, not the classic list.
- OPM-04: 'Drop shipping' is on the board as a way to avoid holding stock. LIFO is deliberately absent because it is a costing method (covered by ACC-04 in fin), so a student who types it gets no credit.
- POB-05 and BA-04: both are fairly open prompts (unethical or illegal practices; business software). The boards are wide at 16 rows, but well-known answers such as money laundering or supply chain management software earn no credit.
- LAW-04: 'osha' is accepted as an alias for the Occupational Safety and Health Act although OSHA is strictly the agency. I kept it as common student usage.
- Several rows keep aliases that are valid answers to the prompt but not the same thing as the display answer, for example 'vandalism' is absent now with POB-04 gone, but 'nepotism' sits under Conflict of interest (POB-05), 'prisons' under Courts (ECO-04) and 'countervailing duties' under Anti-dumping duties (ECO-05). Credit is correct; only the label shown differs.
- Originals BMA-01, ECO-01, ECO-02, POB-01, POB-03, LAW-01, LAW-02 have 6 or 7 answers and LAW-03 has 17, outside the 8 to 16 target. I left them alone as instructed (near-closed sets; the test allows 6+). A human should decide whether to exempt or expand them.
- HRM-01: 'bonus', 'profit sharing', 'childcare' and perks such as 'company car' or 'free meals' are not accepted. Bonuses are incentive pay rather than benefits in most texts, but students will type it; consider rewording or adding rows.
- OPM-04: 'First in, first out' is accepted as a stock-rotation method, but 'LIFO' is not (it is a valuation method, not a physical handling method). Students may see that as inconsistent; there is also light overlap with ACC-04 in the finance file.
- POB-05: 'monopoly' / 'antitrust violations' are not accepted (only price fixing / collusion). Bait and switch and price fixing also appear on the marketing prompt PRC-04; the prompts are different enough that I kept both.
- LAW-04: Social Security Act, Employee Polygraph Protection Act, Rehabilitation Act and workers compensation (state law) are not on the board; I left them out as debatable or too obscure.
- LAW-05: 'strict liability' is an alias of Product liability although it is a somewhat broader category; left as is because it is a reasonable student answer.
- BCM-04: bare 'address' now credits Heading (level 3) rather than Inside address (level 4); an editorial choice.
- ECO-06: the prompt mixes demand and supply shifters on one board by design; it reads fairly but a human may prefer two separate prompts.
- LAW-04 level swap (OSHA 1, ADA 2) and ECO-04 Health programs at level 3 are editorial estimates.

### Entrepreneurship

- SUP-01: the Business Model Canvas is a closed set of nine blocks, all on the board. I kept it because nine clears the 8-answer minimum, but it is not truly open.
- SUP-03: 'Open a business bank account' is a setup step rather than a strictly legal or registration step; kept because it is in standard start-a-business checklists.
- SUP-03: 'articles of organization' (LLC) is an alias of 'File articles of incorporation' (corporation), and 'operating agreement' is an alias of 'Write a partnership agreement'; analogous documents, not identical.
- FND-04: Invoice factoring and Merchant cash advance are legally sales of receivables, not loans; kept because the prompt says 'loan or debt financing' and intro texts list them there.
- FND-05: still the loosest prompt in the cluster even after rewording; a human may prefer to narrow it further or drop it (the cluster would stay at 36).
- FRN-03: 'encroachment' is an alias of Territory limits; related, but not the same idea.
- GRO-03: E-commerce is arguably a form of exporting, and Wholly owned subsidiary and Acquisition are forms of Foreign direct investment; all kept as separate rows.
- GRO-04: no level 1 answer on the board, and Market capitalization only applies to publicly traded companies.
- Duplicate check against the other four bank files was a keyword search of prompt text only, not a full read; it found no near-duplicates.
- SBM-07: new prompt written by me and not independently fact-checked; levels are my estimates. It reads as fairly easy but is marked diff 2 because Small Business Management already has three diff 1 prompts and no diff 3
- SBM-04 removal was a judgment call: a business-tax prompt is a legitimate entrepreneurship topic, and could be restored if the owner thinks it is distinct enough from PFL-04
- FND-04 (business loan or debt types) overlaps partly with CRD-01 in fin.ts (loan or consumer credit): line of credit, home equity loan, personal loan and credit card are on both. I kept it because most of the board is business-specific
- FRN-01 (fee or cost a franchisee pays) shares generic answers with SUP-02 (startup costs): equipment, inventory, rent, signage, insurance. Kept, but a human may prefer narrowing FRN-01 to fees paid to the franchisor
- FND-05 is still an open 'name a term' prompt; valid answers such as pitch deck, stock options and equity crowdfunding are not on the board because it is at the 16-row limit
- ENT-04: optimistic, organized, responsible and honest are plausible answers that are not accepted; the board is at 16 rows
- SBM-05: 'inventory' and 'cost of goods sold' are deliberately not accepted as operating expenses, and 'taxes' now maps to Property taxes; confirm that is the intended strictness
- GRO-04: bare measures such as profit, revenue, assets and cash flow now count toward the related valuation method; confirm that generosity is wanted
- GRO-02: bankruptcy is not accepted as an exit strategy (left out on purpose)
- ENT-01 (original, untouched): Corporation, S corporation and B corporation are one typo apart, so a mistyped entry could land on the wrong row
- Difficulty mix is 11 easy, 17 medium, 9 hard, a little heavy on medium; Growth and Exit has exactly 4 prompts and none at diff 1

### Finance

- PFL-04: still overlaps with SBM-04 in ent.ts ('Name a tax a small business may have to pay') on income, sales, property, payroll, excise, capital gains, self-employment and use tax. I kept it with a household framing; decide whether both should stay for the all-clusters mode.
- CRD-01: partly overlaps FND-04 in ent.ts (types of small business loan). I kept it because the consumer framing differs. The alias 'revolving credit' on Line of credit is broader than the row but is still a valid answer to the prompt.
- BNK-02: only about 9 legitimate answers exist (Federal Reserve tools), so the board is close to a closed set. 'Reserve requirements' is still taught as a tool although the requirement has been zero since 2020, which the why states.
- PFL-07: 'Glass-Steagall Act' is kept as a depositor-protection law (it created the FDIC), but its separation of commercial and investment banking was repealed in 1999. A reviewer may prefer to drop it.
- ACC-06: 'Purchase requisition' and 'Bank statement' are listed as source documents in many but not all textbooks. Kept at high levels.
- INV-05: Treasury bills are deliberately not accepted because they are not bonds; a student typing 'treasury bill' gets no credit.
- INS-04: 'Deductible' and 'Coverage amount' are policy choices that change the premium rather than rating factors about the driver. Kept as legitimate answers to the wording.
- FIN-04: 'Return on investment' was added by me and 'Cost-benefit analysis' was kept; both are general evaluation methods rather than strict capital budgeting techniques.
- Topics Banking, Investing, Insurance and Credit are new for this cluster and are not in LEGACY_CATEGORY_CLUSTER in lib/questions/clusters.ts. That map appears to be used only for migrating old saved stats, so I expect no effect, but I did not trace it.
- CRD-05: new prompt written by me and not independently fact-checked; check the levels and whether 'Negotiating with the lender' (aliases 'payment plan', 'hardship plan') is too loose
- BNK-02: Moral suasion and Margin requirements are older-textbook Fed tools rather than current primary tools; remove if the owner wants only modern tools
- FIN-04: 'break-even analysis' is not accepted; students may type it, but it is not a standard capital budgeting method so I left it out
- FIN-05: board is at the 16-row cap, so 'portfolio manager', 'economist', 'controller' and 'treasurer' are not accepted
- FIN-06: 'inflation' is not accepted as a time value of money term (board at 16 rows); a student may reasonably type it
- BNK-01: board is at the 16-row cap, so 'direct deposit', 'investment services' and 'retirement account (IRA)' are not accepted
- CRD-04: 'default' and 'cosigner' are not accepted (board at 16 rows); consider swapping one in for Finance charge or Amortization
- INV-05: T-bills are accepted under 'Treasury note or bill' although a bill is strictly not a bond; check the owner is happy with that leniency
- PFL-07: Glass-Steagall Act is accepted as a consumer protection law (it created deposit insurance) although much of it was repealed in 1999
- INS-03 and INV-05: short alias pairs 'e and o' / 'd and o' and 't bond' / 'i bond' are one typo apart; exact typing resolves correctly, only a mistyped entry could land on the wrong row
- Difficulty mix is 11 easy, 14 medium, 12 hard; Banking, Insurance and Credit each sit at the minimum of 4 prompts

### Hospitality + Tourism

- RFS-08: this is a closed set of exactly nine allergens rather than an open prompt. It meets the 8-answer minimum and has level 5 and 6 answers, so I kept it; a human should decide whether a closed nine-item set suits the game.
- Near-typo pairs deliberately left in place, because exact matches always win and removing an alias would make that typed answer fuzzy-match the wrong row: RFS-02 'pantry chef' vs 'Pastry chef'; EVT-04 'v shape' vs 'U-shape'; SPE-06 'brands' vs 'bands'; SPE-05 'contests' vs 'concerts'; TRV-01 'edutourism' vs 'Ecotourism', 'farm tourism' vs 'Dark tourism', 'spa tourism' vs 'Space tourism'; RFS-05 'plated service' vs 'platter service'; LDG-02 'room attendant' vs 'door attendant'; LDG-05 'AAA rate' vs 'aarp rate'; TRV-03 'rideshare' vs 'bike share'. Only a mistyped answer can land on the wrong row.
- RFS-05: 'english service' is an alias of 'Family-style service'. Most hospitality texts equate them, but some define English service as the host plating at the table.
- RFS-02: 'baker' is an alias of 'Pastry chef' and 'Expediter' is listed as back-of-house. Both are defensible but loose.
- SPE-01: 'Prize money' (level 5) and 'Player transfer fees' (level 6) are true mainly for soccer, racing and esports, not the major US leagues.
- LDG-05: 'flexible rate' is an alias of 'Best available rate' and 'negotiated rate' an alias of 'Corporate rate'; common usage, not strict synonyms.
- TRV-07 and EVT-03 are at the 16-row cap and lack some plausible answers (TRV-07: natural landmarks such as mountains or lakes; EVT-03: church, beach, barn).
- RFS-03 (front-of-house positions) uses area 'Customer Relations'; 'Operations' would also fit.
- Scope: only HT-01, HT-02 and HT-03 exist at HEAD, so HT-04 and all LDG, RFS, TRV, EVT and SPE prompts (34) were reviewed as new. No cross-cluster duplicates found; topic counts are 4/7/8/7/5/6 and difficulty is 15 easy, 12 medium, 10 hard.
- RFS-08: only 9 answers exist (the nine major allergens), so the board cannot grow. 'gluten' is deliberately not accepted for Wheat; a student may feel that is harsh.
- RFS-01: 'Pizzeria' is on the board although the prompt says to classify by service style rather than cuisine. Left in so a student is not penalised, but it sits awkwardly with the wording.
- RFS-04: 'brunch menu' and 'takeout menu' are not accepted; the board is at 16 rows and I did not want to drop a textbook term to fit them.
- LDG-01: I dropped 'Studio' and 'Quad' to fit Standard and Deluxe. Both dropped terms are genuine textbook room types, so check you agree with the trade.
- LDG-02: 'Server or bartender' joins two different jobs in one row to save space, and 'Director of sales' and 'Revenue manager' no longer score.
- RFS-06 and RFS-07: the merged rows ('Holding food at safe temperatures', 'Overhead') mean hot holding vs refrigeration, and rent vs utilities, now score as one answer each.
- EVT-01: 'graduation', 'reunion' and 'anniversary party' are not accepted; the board is full at 16.
- LDG-05: 'Group rate' is level 1 and 'Rack rate' level 2. Left as written, but a room of hospitality students might say rack rate first.

### Marketing

- PRC-04: 'Resale price maintenance' (level 6) - in the US this has been judged case by case (rule of reason) since 2007 rather than banned outright; it fits 'restrict or prohibit' but a human may prefer to drop it. 'Dumping' is restricted by trade law rather than domestic pricing law.
- PRC-03: 'Coupon' and 'Markdown' are counted as discount types; they are price reductions but not classic textbook discount/allowance categories.
- PROM-02: 'Product placement' and 'Trade shows' are listed as sales promotion tools in some high-school marketing texts but classed elsewhere (advertising/PR, personal selling) in others.
- PROM-03: 'Social media' and 'Lobbying' as public relations tools - standard in college texts, less so in high-school ones.
- PROM-05: alias 'interior displays' on Point-of-purchase display is broader than the display answer; left in because a student typing it deserves credit, but it is not a strict synonym.
- MKT-09: board mixes top-level categories (convenience, shopping) with sub-types of convenience products (staple, impulse, emergency goods); all are legitimate classifications but levels are a judgment call.
- BRD-02: rows Co-branding and Rebranding are two letters apart (both level 3, exact match wins, so no scoring harm).
- CHN-03: rows Rack jobber and Truck jobber are two edits apart; exact matches win but a badly mistyped answer could land on the other row (both level 5).
- BRD-04: positioning sits under the Branding topic with area Product/Service Management; sensible but a human may prefer the Marketing topic.
- MKT-08 (section of a marketing plan) overlaps in several answers with ENT-03 (section of a business plan) in ent.ts. I kept it because the documents differ; a human may want to decide whether both should stay.
- PROM-04: 'clicks' now counts as Click-through rate and 'views' as Impressions. These are close but not identical measures; remove the aliases if strictness matters more than leniency.
- PRC-04: 'loss leader' is now accepted under Selling below cost. This is only restricted in some US states (minimum price laws), so check you are happy crediting it as a restricted practice.
- MKT-09: a student could reasonably type 'durable goods' or 'nondurable goods', which are not on the board. I left the prompt wording alone; consider rewording it to say 'by how they are bought or used' if this comes up.
- MKT-09: 'services' is accepted as Business services, although a student might mean services in the goods-versus-services sense.
- CHN-03: Rack jobber and Truck jobber are two typos apart, so a badly misspelt entry could be credited to the wrong one. Exact spellings match correctly.
- PRC-03: three level 1 answers (Student discount, Quantity discount, Coupon). Quantity discount may sit better at level 2; I left it.
- Original prompts MKT-02 (7 answers), MKT-05 (6) and SEL-03 (7) are below the 8-answer minimum. They are originals and pass the test as closed sets, so I did not touch them.

## New prompts

### Business Management + Administration

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| HRM-01 | Human Resources | Easy | 16 | Name an employee benefit a company might offer on top of wages or salary. |
| HRM-02 | Human Resources | Medium | 15 | Name a method of training employees. |
| HRM-03 | Human Resources | Medium | 13 | Name a characteristic that U.S. federal law protects from employment discrimination. |
| HRM-04 | Human Resources | Hard | 15 | Name a method of evaluating employee performance. |
| OPM-01 | Operations | Easy | 16 | Name a measure a store can use to prevent theft. |
| OPM-02 | Operations | Medium | 13 | Name a production method or approach a manufacturer can use. |
| OPM-03 | Operations | Hard | 16 | Name a method or tool companies use to manage or improve quality. |
| OPM-04 | Operations | Hard | 15 | Name a method or tool for managing inventory. |
| BCM-01 | Business Communication | Easy | 15 | Name a form of written business communication. |
| BCM-02 | Business Communication | Medium | 16 | Name a barrier to effective communication. |
| BCM-03 | Business Communication | Easy | 11 | Name a type of nonverbal communication. |
| BCM-04 | Business Communication | Medium | 13 | Name a part of a formal business letter. |
| BMA-04 | Business Management | Hard | 16 | Name a theory of management or employee motivation. |
| BMA-05 | Business Management | Hard | 16 | Name a tool or document used to plan and manage a project. |
| ECO-04 | Economics | Easy | 16 | Name a public service or program that governments commonly pay for with tax money. |
| ECO-05 | Economics | Medium | 12 | Name a trade barrier a government can use to limit imports or trade with another country. |
| ECO-06 | Economics | Hard | 15 | Name a factor that can shift the demand curve or the supply curve for a product. |
| BA-04 | Business Administration | Easy | 16 | Name a type of software or information system a business uses to run its operations. |
| POB-05 | Principles of Business | Medium | 16 | Name an unethical or illegal business practice. |
| LAW-04 | Business Law | Hard | 15 | Name a U.S. federal law that protects workers. |
| LAW-05 | Business Law | Hard | 16 | Name a tort, a civil wrong that one party can sue another for. |

### Entrepreneurship

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| ENT-04 | Entrepreneurship | Easy | 16 | Name a trait of successful entrepreneurs. |
| ENT-05 | Entrepreneurship | Medium | 12 | Name a type of entrepreneurship or entrepreneur. |
| ENT-06 | Entrepreneurship | Medium | 14 | Name a source of ideas for a new business. |
| SUP-01 | Startup Planning | Medium | 9 | Name a building block of the Business Model Canvas. |
| SUP-02 | Startup Planning | Easy | 16 | Name a startup cost for a new business. |
| SUP-03 | Startup Planning | Medium | 13 | Name a legal or registration step in starting a new business. |
| SUP-04 | Startup Planning | Hard | 9 | Name an area examined in a feasibility study. |
| SUP-05 | Startup Planning | Easy | 16 | Name a factor to consider when choosing a location for a new business. |
| SUP-06 | Startup Planning | Medium | 12 | Name a professional or adviser a new business owner should consult. |
| FND-01 | Funding | Medium | 14 | Name an element of an investor pitch. |
| FND-02 | Funding | Hard | 15 | Name something a lender reviews before approving a small business loan. |
| FND-03 | Funding | Medium | 16 | Name a way a startup can reduce the cash it needs to launch. |
| FND-04 | Funding | Hard | 15 | Name a type of loan or debt financing a small business can use. |
| FND-05 | Funding | Hard | 16 | Name a term used in startup equity investing, such as a type of investor, a funding stage, a document or a deal term. |
| SBM-01 | Small Business Management | Easy | 16 | Name a reason small businesses fail. |
| SBM-02 | Small Business Management | Medium | 14 | Name an organization or program that helps people start or run a small business in the United States. |
| SBM-03 | Small Business Management | Medium | 16 | Name a way a small business can improve its cash flow. |
| SBM-07 | Small Business Management | Medium | 16 | Name a risk that could cause a loss for a small business. |
| SBM-05 | Small Business Management | Easy | 16 | Name an ongoing operating expense of a small business. |
| SBM-06 | Small Business Management | Easy | 16 | Name a task a small business commonly outsources. |
| INO-01 | Innovation | Medium | 16 | Name a technique for generating new business or product ideas. |
| INO-02 | Innovation | Hard | 16 | Name a concept from the lean startup method. |
| INO-03 | Innovation | Medium | 15 | Name a type of innovation. |
| INO-04 | Innovation | Easy | 16 | Name a way to test a business idea with customers before a full launch. |
| INO-05 | Innovation | Easy | 16 | Name a competitive advantage a new business can build. |
| FRN-01 | Franchising and Ownership | Medium | 15 | Name a fee or cost a franchisee pays. |
| FRN-02 | Franchising and Ownership | Easy | 15 | Name an advantage of buying a franchise. |
| FRN-03 | Franchising and Ownership | Easy | 13 | Name a disadvantage of buying a franchise. |
| FRN-04 | Franchising and Ownership | Hard | 16 | Name an item disclosed in a Franchise Disclosure Document. |
| FRN-05 | Franchising and Ownership | Hard | 12 | Name a factor to weigh when choosing a form of business ownership. |
| GRO-01 | Growth and Exit | Medium | 14 | Name a strategy a business can use to grow. |
| GRO-02 | Growth and Exit | Medium | 11 | Name an exit strategy for a business owner. |
| GRO-03 | Growth and Exit | Hard | 13 | Name a way a business can enter a foreign market. |
| GRO-04 | Growth and Exit | Hard | 11 | Name a method or measure used to value a business that is for sale. |

### Finance

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| FIN-04 | Finance | Hard | 11 | Name a method used to evaluate a capital investment project. |
| FIN-05 | Finance | Easy | 16 | Name a career in the finance industry. |
| FIN-06 | Finance | Hard | 16 | Name a term or concept used in time value of money calculations. |
| ACC-04 | Accounting | Medium | 11 | Name an accounting method for valuing inventory or depreciating an asset. |
| ACC-05 | Accounting | Hard | 13 | Name a generally accepted accounting principle or assumption. |
| ACC-06 | Accounting | Medium | 15 | Name a source document used to record a business transaction. |
| ACC-07 | Accounting | Hard | 16 | Name a line or section on a statement of cash flows. |
| PFL-04 | Personal Financial Literacy | Easy | 13 | Name a tax that an individual or household may have to pay. |
| PFL-05 | Personal Financial Literacy | Easy | 16 | Name a spending or saving category in a personal or household budget. |
| PFL-06 | Personal Financial Literacy | Medium | 16 | Name a type of financial fraud or scam aimed at consumers. |
| PFL-07 | Personal Financial Literacy | Hard | 16 | Name a U.S. federal law that protects consumers or investors in financial matters. |
| BNK-01 | Banking | Easy | 16 | Name a product or service a retail bank offers its customers. |
| BNK-02 | Banking | Hard | 11 | Name a tool or action the Federal Reserve uses to carry out monetary policy. |
| BNK-03 | Banking | Easy | 14 | Name a way to make a payment without using cash. |
| BNK-04 | Banking | Medium | 13 | Name a fee a bank may charge on a checking or savings account. |
| INV-01 | Investing | Hard | 11 | Name a type of stock order that sets how or when a trade is carried out. |
| INV-02 | Investing | Medium | 12 | Name a type of risk an investor faces. |
| INV-03 | Investing | Easy | 14 | Name a stock market index. |
| INV-04 | Investing | Medium | 14 | Name a stock exchange. |
| INV-05 | Investing | Medium | 16 | Name a type of bond. |
| INS-01 | Insurance | Medium | 16 | Name a key term used in an insurance policy. |
| INS-02 | Insurance | Medium | 11 | Name a type of coverage that can be part of an auto insurance policy. |
| INS-03 | Insurance | Hard | 16 | Name a type of insurance that a business buys to protect itself. |
| INS-04 | Insurance | Easy | 16 | Name a factor an insurer may use to set the price of an auto insurance policy. |
| CRD-01 | Credit | Easy | 16 | Name a type of loan or consumer credit. |
| CRD-03 | Credit | Medium | 15 | Name an item of information found on a credit report. |
| CRD-04 | Credit | Hard | 16 | Name a term or condition spelled out in a loan or credit card agreement. |
| CRD-05 | Credit | Hard | 15 | Name a debt-relief option or arrangement open to a borrower who is struggling to repay. |

### Hospitality + Tourism

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| HT-04 | Hospitality and Tourism | Easy | 16 | Name an amenity a hotel may offer its guests. |
| LDG-01 | Lodging | Easy | 16 | Name a type of hotel guest room. |
| LDG-02 | Lodging | Easy | 16 | Name a job position in a hotel. |
| LDG-03 | Lodging | Hard | 12 | Name a metric a hotel uses to measure its performance. |
| LDG-04 | Lodging | Medium | 14 | Name a task carried out at a hotel front desk. |
| LDG-05 | Lodging | Hard | 16 | Name a type of room rate a hotel may offer. |
| LDG-06 | Lodging | Medium | 14 | Name a benefit a hotel loyalty program gives its members. |
| LDG-07 | Lodging | Hard | 16 | Name a room status term used by hotel housekeeping and the front desk. |
| RFS-01 | Restaurants and Food Service | Easy | 16 | Name a type of restaurant, classified by its service style or format rather than its cuisine. |
| RFS-02 | Restaurants and Food Service | Medium | 16 | Name a kitchen (back-of-house) position in a restaurant. |
| RFS-03 | Restaurants and Food Service | Easy | 15 | Name a front-of-house position in a restaurant. |
| RFS-04 | Restaurants and Food Service | Medium | 16 | Name a type of menu. |
| RFS-05 | Restaurants and Food Service | Hard | 16 | Name a style of food service a restaurant or caterer can use. |
| RFS-06 | Restaurants and Food Service | Easy | 16 | Name a practice that keeps food safe in a commercial kitchen. |
| RFS-07 | Restaurants and Food Service | Hard | 16 | Name a cost or metric a restaurant manager tracks. |
| RFS-08 | Restaurants and Food Service | Medium | 9 | Name one of the nine major food allergens that U.S. food businesses must watch for. |
| TRV-01 | Travel and Tourism | Easy | 16 | Name a type of tourism, classified by the purpose of the trip. |
| TRV-02 | Travel and Tourism | Hard | 11 | Name a travel intermediary that sells, packages or distributes travel. |
| TRV-03 | Travel and Tourism | Easy | 16 | Name a mode of transportation travelers use. |
| TRV-04 | Travel and Tourism | Medium | 16 | Name a tool or tactic a destination uses to market itself to visitors. |
| TRV-05 | Travel and Tourism | Medium | 16 | Name a practice a hotel or destination can adopt to make tourism more sustainable. |
| TRV-06 | Travel and Tourism | Hard | 15 | Name a source of ancillary revenue for an airline beyond the base ticket price. |
| TRV-07 | Travel and Tourism | Easy | 16 | Name a type of visitor attraction. |
| EVT-01 | Events | Easy | 16 | Name a type of event a planner might organize. |
| EVT-02 | Events | Medium | 16 | Name something an event planner must arrange when planning an event. |
| EVT-03 | Events | Easy | 16 | Name a type of event venue. |
| EVT-04 | Events | Hard | 11 | Name a room seating layout used for a meeting or event. |
| EVT-05 | Events | Medium | 16 | Name a vendor or professional an event planner hires for an event. |
| SPE-01 | Sports and Entertainment | Easy | 15 | Name a revenue stream for a professional sports team. |
| SPE-02 | Sports and Entertainment | Hard | 16 | Name a right or asset a team or event can include in a sponsorship package for a company. |
| SPE-03 | Sports and Entertainment | Medium | 14 | Name a type of ticket or ticket package a team or venue sells. |
| SPE-04 | Sports and Entertainment | Easy | 16 | Name a category of licensed merchandise a team or entertainment brand sells. |
| SPE-05 | Sports and Entertainment | Medium | 16 | Name a promotion a team uses to boost attendance at games. |
| SPE-06 | Sports and Entertainment | Hard | 15 | Name a type of property whose name or image is licensed for use on merchandise. |

### Marketing

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| MKT-07 | Marketing | Easy | 16 | Name a cultural, social, personal or psychological factor that influences consumer buying behavior. |
| MKT-08 | Marketing | Medium | 15 | Name a section of a marketing plan. |
| MKT-09 | Marketing | Hard | 14 | Name a category used to classify consumer or business products. |
| SEL-04 | Professional Selling | Hard | 9 | Name a specialized method a salesperson can use to answer a customer objection. |
| SEL-05 | Professional Selling | Medium | 12 | Name a way a salesperson can find new prospects. |
| SEL-06 | Professional Selling | Easy | 14 | Name a way a business keeps customers coming back after the sale. |
| PROM-01 | Promotion | Easy | 16 | Name an advertising medium. |
| PROM-02 | Promotion | Medium | 16 | Name a sales promotion tool. |
| PROM-03 | Promotion | Medium | 14 | Name a public relations tool. |
| PROM-04 | Promotion | Hard | 16 | Name a metric used to measure digital marketing results. |
| PROM-05 | Promotion | Medium | 14 | Name an element of visual merchandising. |
| PRC-01 | Pricing | Easy | 15 | Name a factor that affects the price a business sets. |
| PRC-02 | Pricing | Medium | 11 | Name a goal a business may be trying to reach through its pricing. |
| PRC-03 | Pricing | Medium | 15 | Name a type of discount or allowance a seller offers to buyers. |
| PRC-04 | Pricing | Hard | 10 | Name a pricing practice that laws restrict or prohibit. |
| CHN-01 | Channels | Easy | 16 | Name a type of retailer. |
| CHN-02 | Channels | Medium | 10 | Name an activity that is part of physical distribution. |
| CHN-03 | Channels | Hard | 13 | Name a type of wholesaler or agent intermediary. |
| CHN-04 | Channels | Hard | 13 | Name a job that intermediaries perform for producers in a distribution channel. |
| MKR-01 | Market Research | Easy | 11 | Name a method of collecting primary market research data. |
| MKR-02 | Market Research | Medium | 14 | Name a source of secondary market research data. |
| MKR-03 | Market Research | Medium | 12 | Name a step in the marketing research process. |
| MKR-04 | Market Research | Hard | 12 | Name a sampling method used in research. |
| MKR-05 | Market Research | Medium | 11 | Name a type of question used on a market research survey. |
| BRD-01 | Branding | Easy | 13 | Name an element of a brand. |
| BRD-02 | Branding | Hard | 13 | Name a branding strategy or type of brand. |
| BRD-03 | Branding | Easy | 11 | Name a job that packaging does for a product. |
| BRD-04 | Branding | Medium | 11 | Name a basis a company can use to position a product in the minds of customers. |

