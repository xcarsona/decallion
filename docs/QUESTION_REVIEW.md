# Question review

Every prompt added in the career-cluster rebuild is listed here so a person can review the content. The answer boards themselves are in `lib/questions/bank/`, one file per cluster.

Each new prompt was written by one AI agent, fact-checked by a second and play-tested by a third. None has been reviewed by a person or checked against a textbook, and the answer levels are editorial estimates. Nothing here claims to map to official DECA performance indicators.

## Counts

| Cluster | Prompts | Original | New | Topics |
|---|---|---|---|---|
| Business Management + Administration (`bma`) | 50 | 15 | 35 | 8 |
| Entrepreneurship (`ent`) | 50 | 3 | 47 | 7 |
| Finance (`fin`) | 50 | 9 | 41 | 7 |
| Hospitality + Tourism (`ht`) | 50 | 3 | 47 | 6 |
| Marketing (`mkt`) | 50 | 9 | 41 | 7 |
| **Total** | **250** | **39** | **211** | |

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
- BMA-07: a named closed set of exactly ten (Mintzberg roles), intro-college level; all ten are on the board so it is fair, but the owner may find it too closed or too hard for high-school competitors.
- BCM-06: the communication process has only about nine standard elements and all nine are on the board; it is a near-closed set, similar in shape to the original LAW-01.
- POB-07: area is 'Economics' for a social responsibility prompt; defensible (role of business in society) but the owner may prefer another area.
- HRM-05: Stock options sits here as direct pay and also in the original HRM-01 as an employee benefit; both are defensible, but it is inconsistent across the two boards.
- POB-07: 'matching gifts' and 'matching donations' are aliases of Corporate foundation (level 6); they are valid answers but not the same thing as a foundation.
- BMA-06: 'contingency planning' is an alias of Scenario planning and 'environmental scan' of PEST analysis; related and creditable, but not strict synonyms.
- BCM-05: 'flip chart' and the alias 'flowchart' (under Diagram) are two typos apart at 9 letters, so a badly misspelled entry could land on the wrong row; exact spellings match correctly.
- ECO-07: board is full at 16, so CAFTA-DR, EFTA and CARICOM are valid answers that earn no credit.
- BMA-07 (Mintzberg roles): a closed set of exactly 10 answers, all on the board. It is within the 8 to 16 rule but is recall of a fixed list, not an open prompt; keep only if that style is wanted.
- BCM-06 (communication process): only 9 rows, also a near-closed list. 'barriers' and 'distractions' are accepted as Noise, and 'environment' as Context.
- HRM-05: 'Stock options' counts as direct pay here, while the original HRM-01 lists stock options as a benefit. Both are defensible, but a player could notice the overlap.
- HRM-05 overlaps a little with fin.ts PFL-08 (sources of household income) on salary, wages and tips; I judged the angle different enough to keep.
- POB-06: 'Customer demand' and 'Suppliers' are counted as uncontrollable external forces (micro-environment); some textbooks limit this list to the macro forces only.
- POB-07: its area is 'Economics'; confirm that is the instructional area name you want for social responsibility.
- ECO-07: G7, G20 and BRICS are accepted as economic organizations; they are forums, not treaty bodies. United Nations is deliberately not accepted.
- OPM-06: the merged row 'Falling objects or moving vehicles' joins two different hazards under one level 4 answer; split it again if you would prefer to drop another row instead.

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
- FRN-07: 'Job franchise' and 'Investment franchise' (both level 6) come from franchise-industry typologies, not from every mainstream textbook. They are real categories, but if you want strictly textbook answers, drop them and raise 'Conversion franchise' to level 6 (the board would still have 9 rows).
- FRN-07: 'dealership' is kept as an alias of Product distribution franchise (car dealerships are the classic example), though not every dealership is a franchise.
- INO-06: still time-sensitive and fairly open. The board is at the 16-row limit, so '5G' or 'streaming' earn no credit. 'cryptocurrency', 'crypto' and 'bitcoin' are aliases of Blockchain, and 'automation' of Robotics; these are related rather than identical.
- ENT-07: 'Tax deductions' (level 6) is true and appears in popular lists, but not all textbooks list it as a reward of entrepreneurship.
- GRO-06: a bare 'customs' matches Customs paperwork (level 5), although a student might mean cultural customs (level 1). Either is a valid answer, but the higher level is awarded.
- SBM-08: 'futa' is an alias of Register for unemployment insurance tax; the federal tax is paid rather than registered for, so it is a loose fit.
- SUP-08: 'markup' and 'direct sales' are aliases of Product sales; both are loose (one is a pricing term, the other a channel term).
- FND-06: 'Burn rate' and 'Churn rate' are two typos apart, so a badly mistyped entry could match the wrong row; exact entries are unaffected.
- INO-06 (emerging technology): the most open-ended new prompt. The board is full at 16 rows, so plausible answers such as 5G, social media and e-commerce get no credit. Consider narrowing the wording or swapping a row.
- FND-06: 'Net promoter score' was removed to make room for 'Cash flow'. Restore it in place of another row if you would rather keep it.
- FRN-07: 'Job franchise' and 'Investment franchise' (level 6) and 'Co-branding' (level 5) appear in some franchising textbooks but not all. Worth a quick look by someone who knows the course material.
- SUP-08: 'markup' is accepted as an alias for 'Product sales' and 'marketplace' for 'Commission'. Both are loose but defensible; I left them.
- ENT-07: 'job security' is not accepted as a reward of entrepreneurship. Some textbooks list it and others call it a risk, so I left it off.

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
- INS-05: 'Power surge' (level 6) is a named peril in standard policies, but coverage for electronics varies by policy; consider removing it if you want only clear-cut answers. 'Hurricane' is deliberately not accepted because wind is covered and storm flooding is not.
- INS-05: 'snow' and 'ice' are accepted as aliases for Weight of ice or snow; these are loose.
- CRD-06: Private mortgage insurance (level 4) is usually paid monthly rather than at closing, although an initial premium or escrow often is collected then. Earnest money and the down payment are credited toward the price rather than being fees.
- CRD-07: Construction loan (level 6) is short-term financing that some textbooks do not class as a mortgage type.
- INV-07: the board is the 11 standard market sectors, so industry answers such as 'retail', 'automotive' or 'banking' earn no credit; 'oil and gas' is still accepted for Energy.
- PFL-08: a student who types 'investments' gets no credit because it spans the Interest, Dividends and Capital gains rows; Scholarships or grants (level 6) is debatable as income.
- BNK-05: 'name' is accepted for the account holder row (level 4), though a student could mean the payee (level 2).
- ACC-08: one-word aliases such as 'cost', 'public', 'private', 'management' and 'international' are accepted; Payroll accounting (level 5) is a loose fit as a branch.
- INS-06: Permanent life now sits beside Whole life, Universal life and Variable life as a parent category, so a student can score both the category and its members.
- ACC-02 (original, not changed): the why contains an escaped apostrophe (owners\' stake) and one row uses a double-quoted string; valid TypeScript, but against the no-apostrophe style rule.
- PFL-08: 'Investment income' (level 2) now sits beside its own sub-types Interest, Dividends and Capital gains (levels 3 to 4). I think that is fair to the player, but an editor may prefer a different arrangement. The board also now has a single level 1 row instead of two.
- PFL-08 vs HRM-05 in bma.ts ('Name a form of direct pay an employee can earn for doing a job'): they share wages, salary, tips, commission and bonus. I kept PFL-08 because it is much broader (investment, rental, benefits, royalties), but it is the closest cross-cluster overlap.
- CRD-07 (type of mortgage) vs CRD-01 (type of loan or consumer credit, original): 'home equity loan' and 'heloc' are accepted on both, as a second mortgage on CRD-07. Judged different enough to keep.
- CRD-06: the bare alias 'insurance' credits Homeowners insurance (level 3) although the board also has Private mortgage insurance and Title insurance rows. It is generous rather than wrong; remove the alias if you want it stricter.
- CRD-06: 'Closing costs' (level 2) is an umbrella answer on a board that also lists individual closing costs. Kept because students will type it.
- INS-06: 'Permanent life' (level 3) is a category that contains whole, universal and variable life, which are also rows. Standard textbook term, kept.
- INS-05: 'Power surge' (level 6) relies on the standard-policy peril of sudden damage from artificially generated electrical current; coverage varies by policy, so worth a human glance.
- INV-07: the board is the 11 standard market sectors, so non-standard answers such as 'retail', 'banking' or 'transportation' get no credit. That is by design, but the set is closed at 11 answers.
- PFL-02 (original, in git HEAD) has only 5 answers. It was left alone as an original and the bank test accepts it, but it is the one board under 8 answers in this cluster.
- The task text describes originals as the prompts in git HEAD (37 here); the earlier summary table counted 9 originals for Finance. I followed git HEAD, so the 28 prompts added in the previous commit were only checked for plain errors, not given the full play-test.

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
- RFS-09: 'Raising menu prices' (level 3) is kept only because the prompt now says food cost percentage; delete the row if the owner wants cost-side controls only.
- HT-07: 'Employee feedback' (level 5) is an indirect way of gathering guest feedback (staff relay what guests say); arguable.
- HT-07: 'suggestion box' is an alias of Comment cards; related but not the same tool.
- HT-06: 'discretionary income' is an alias of Disposable income; they are distinct economic terms, though both are valid answers to the prompt.
- LDG-09: 'military' is an alias of Government travelers while SMERF groups (level 6) also covers military groups; and the 'Transient guests' row overlaps conceptually with business and leisure travelers.
- LDG-08 why: 'Housekeeping is usually the largest department in a hotel' is a common textbook claim (by staff count) that I did not verify against a source.
- TRV-08: the new 'Proof of sufficient funds' row is a real entry or visa requirement in many countries, but confirm the level 6 placement.
- SPE-09: 'Airline and hotel licensing' (level 6) and 'Product placement' (level 4) are legitimate ancillary revenue but less textbook-standard than the other rows.
- EVT-06: 'parking problems' is a loose alias of Transportation delays.
- Fuzzy-match collisions between rows were checked by reasoning only, not by running the matcher; the bank test covers exact alias clashes, not near-typo ones.
- HT-07 (ways a hotel or restaurant gathers guest feedback) overlaps with MKR-01 in mkt.ts (methods of collecting primary research data) on surveys, focus groups and interviews. I kept it because the board is hospitality-specific (online reviews, comment cards, mystery shoppers, table visits); confirm you are happy with both.
- HT-06 (outside factors that move travel demand) is a travel-specific cousin of POB-06 in bma.ts (external environment forces). The answers are different enough that I kept it.
- SPE-07: the narrowing to sports only is an editorial call. Team physician, equipment manager and sports photographer are valid answers still not on the board, which is full at 16.
- LDG-09: 'Tour groups' is now an alias of Groups (level 2) rather than its own level 3 row. 'Budget travelers' and 'Seniors' are plausible answers still not accepted because the board is at 16.
- LDG-09: 'Distressed passengers' (level 6) is a real lodging segment but obscure; check it is in the textbook you teach from.
- EVT-08: bare 'liability' now credits Indemnification. A student could mean liability insurance, which is the separate Insurance requirement row; remove the alias if that feels too loose.
- EVT-06: 'schedule delays / running late' and 'illness outbreak' are plausible answers not on the board, which is full at 16.
- SPE-09: 'International distribution' can overlap in a student's mind with overseas box office (Box office row); both are accepted, at different levels.

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
- MKT-10 / docs/QUESTION_REVIEW.md: if that doc lists MKT-10 it is now stale; the replacement is MKT-11. I did not edit the doc because only mkt.ts was in scope.
- PRC-05 vs SUP-07 (ent.ts): 'Selling price' still appears on both boards. The questions are now clearly different, but confirm you are happy with that small overlap.
- PRC-05: 'Profit' (level 2) and 'Gross margin' (level 3, aliases 'margin', 'profit margin', 'gross profit') are separate rows. Some teachers treat these loosely as one idea; merge them if you prefer.
- BRD-05: 'Price' (level 2) is kept as label information. Price is often on a shelf tag or sticker, not the label itself, so remove the row if you want to be strict.
- BRD-05: 'logo' is an alias of 'Brand name'. A logo is not a name, though both appear on labels; it is lenient, not wrong.
- BRD-06: the board joins two textbook lists (the five brand familiarity levels and the brand equity components). The combined 11 answers are all standard, but the question is two closed sets, not one open one.
- MKR-07: the CRM prompt sits under the Market Research topic with area Customer Relations. It fits, but Marketing-Information Management would also be a sensible area.
- CHN-05: 'direct distribution' and 'indirect distribution' are two typos apart. Exact matches win in the matcher, so correctly typed answers are safe, but a badly misspelled 'indirect' could score as 'direct'.
- PROM-06: 'cooperative' and 'comparative' are also two typos apart, with the same caveat as CHN-05.
- MKT-11: 'Home ownership' is the only level 6 answer. It is listed as a demographic variable in college marketing texts but is the least commonly taught row on the board.
- SEL-07: the prompt 'Name a type of sales job or salesperson' is fairly open; industry-specific answers such as real estate agent or car salesperson get no credit. Consider rewording to 'classified by how or to whom they sell' if play-testers complain.
- PRC-05: a student may type 'discount' for retail pricing math; I left it unaccepted because it is not the same as a markdown. Human call.
- PROM-07: 'price' is a plausible part of a print ad but is not in the standard textbook list, so I left it off.
- MKR-07 and BRD-05 are at the 16-answer cap, so I could not add 'Company name' (business-buyer CRM records) to MKR-07 without dropping another row.
- MKT-11 overlaps a little with original MKT-02 (age, income and gender are aliases of Demographic there); I judged them distinct enough to keep both.
- CHN-05: 'Vertical integration' (level 5) and 'Vertical marketing system' (level 6) are closely related concepts on the same board; both are correct, but check the split feels right.
- Originals were not re-audited beyond the duplicate check. The working tree differs from HEAD by insertions only, so originals appear untouched.

## New prompts

### Business Management + Administration

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| HRM-01 | Human Resources | Easy | 31 | Name an employee benefit a company might offer on top of wages or salary. |
| HRM-02 | Human Resources | Medium | 24 | Name a method of training employees. |
| HRM-03 | Human Resources | Medium | 13 | Name a characteristic that U.S. federal law protects from employment discrimination. |
| HRM-04 | Human Resources | Hard | 23 | Name a method of evaluating employee performance. |
| OPM-01 | Operations | Easy | 26 | Name a measure a store can use to prevent theft. |
| OPM-02 | Operations | Medium | 23 | Name a production method or approach a manufacturer can use. |
| OPM-03 | Operations | Hard | 28 | Name a method or tool companies use to manage or improve quality. |
| OPM-04 | Operations | Hard | 27 | Name a method or tool for managing inventory. |
| BCM-01 | Business Communication | Easy | 29 | Name a form of written business communication. |
| BCM-02 | Business Communication | Medium | 28 | Name a barrier to effective communication. |
| BCM-03 | Business Communication | Easy | 16 | Name a type of nonverbal communication. |
| BCM-04 | Business Communication | Medium | 14 | Name a part of a formal business letter. |
| BMA-04 | Business Management | Hard | 22 | Name a theory of management or employee motivation. |
| BMA-05 | Business Management | Hard | 30 | Name a tool or document used to plan and manage a project. |
| ECO-04 | Economics | Easy | 28 | Name a public service or program that governments commonly pay for with tax money. |
| ECO-05 | Economics | Medium | 18 | Name a trade barrier a government can use to limit imports or trade with another country. |
| ECO-06 | Economics | Hard | 18 | Name a factor that can shift the demand curve or the supply curve for a product. |
| BA-04 | Business Administration | Easy | 34 | Name a type of software or information system a business uses to run its operations. |
| POB-05 | Principles of Business | Medium | 31 | Name an unethical or illegal business practice. |
| LAW-04 | Business Law | Hard | 31 | Name a U.S. federal law that protects workers. |
| LAW-05 | Business Law | Hard | 29 | Name a tort, a civil wrong that one party can sue another for. |
| BA-05 | Business Administration | Easy | 28 | Name a title held by a top executive or officer of a corporation. |
| BA-06 | Business Administration | Medium | 30 | Name a measure a business uses to protect its data and computer systems. |
| POB-06 | Principles of Business | Hard | 18 | Name a force in the external environment that a business cannot control but must watch. |
| POB-07 | Principles of Business | Easy | 29 | Name a way a business can show social responsibility. |
| HRM-05 | Human Resources | Medium | 21 | Name a form of direct pay an employee can earn for doing a job. |
| HRM-06 | Human Resources | Hard | 29 | Name a tactic or process used in labor relations between unions and management. |
| OPM-05 | Operations | Medium | 26 | Name a factor a business weighs when choosing a supplier. |
| OPM-06 | Operations | Easy | 27 | Name a workplace safety hazard. |
| BCM-05 | Business Communication | Easy | 21 | Name a visual aid a speaker can use in a presentation. |
| BCM-06 | Business Communication | Hard | 10 | Name an element of the communication process. |
| BMA-06 | Business Management | Medium | 37 | Name a tool or framework used in strategic planning. |
| BMA-07 | Business Management | Hard | 10 | Name one of the ten managerial roles described by Henry Mintzberg. |
| LAW-06 | Business Law | Medium | 31 | Name a type of contract or legal agreement a business commonly signs. |
| ECO-07 | Economics | Hard | 34 | Name an international trade agreement, trade bloc or economic organization. |

### Entrepreneurship

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| ENT-04 | Entrepreneurship | Easy | 29 | Name a trait of successful entrepreneurs. |
| ENT-05 | Entrepreneurship | Medium | 24 | Name a type of entrepreneurship or entrepreneur. |
| ENT-06 | Entrepreneurship | Medium | 25 | Name a source of ideas for a new business. |
| ENT-07 | Entrepreneurship | Easy | 16 | Name a reward or advantage of being an entrepreneur. |
| SUP-01 | Startup Planning | Medium | 9 | Name a building block of the Business Model Canvas. |
| SUP-02 | Startup Planning | Easy | 24 | Name a startup cost for a new business. |
| SUP-03 | Startup Planning | Medium | 18 | Name a legal or registration step in starting a new business. |
| SUP-04 | Startup Planning | Hard | 14 | Name an area examined in a feasibility study. |
| SUP-05 | Startup Planning | Easy | 22 | Name a factor to consider when choosing a location for a new business. |
| SUP-06 | Startup Planning | Medium | 16 | Name a professional or adviser a new business owner should consult. |
| SUP-07 | Startup Planning | Hard | 19 | Name a matter that a written partnership agreement should settle. |
| SUP-08 | Startup Planning | Medium | 22 | Name a revenue model, a way a business charges customers to make money. |
| FND-01 | Funding | Medium | 23 | Name an element of an investor pitch. |
| FND-02 | Funding | Hard | 22 | Name something a lender reviews before approving a small business loan. |
| FND-03 | Funding | Medium | 25 | Name a way a startup can reduce the cash it needs to launch. |
| FND-04 | Funding | Hard | 26 | Name a type of loan or debt financing a small business can use. |
| FND-05 | Funding | Hard | 38 | Name a term used in startup equity investing, such as a type of investor, a funding stage, a document or a deal term. |
| FND-06 | Funding | Hard | 28 | Name a metric used to track the growth or financial health of a startup. |
| FND-07 | Funding | Medium | 19 | Name a financial statement or projection that belongs in the financial section of a business plan. |
| SBM-01 | Small Business Management | Easy | 29 | Name a reason small businesses fail. |
| SBM-02 | Small Business Management | Medium | 28 | Name an organization or program that helps people start or run a small business in the United States. |
| SBM-03 | Small Business Management | Medium | 22 | Name a way a small business can improve its cash flow. |
| SBM-07 | Small Business Management | Medium | 27 | Name a risk that could cause a loss for a small business. |
| SBM-05 | Small Business Management | Easy | 28 | Name an ongoing operating expense of a small business. |
| SBM-06 | Small Business Management | Easy | 25 | Name a task a small business commonly outsources. |
| SBM-08 | Small Business Management | Hard | 23 | Name a step a small business takes when it hires its first employee. |
| INO-01 | Innovation | Medium | 36 | Name a technique for generating new business or product ideas. |
| INO-02 | Innovation | Hard | 27 | Name a concept from the lean startup method. |
| INO-03 | Innovation | Medium | 25 | Name a type of innovation. |
| INO-04 | Innovation | Easy | 25 | Name a way to test a business idea with customers before a full launch. |
| INO-05 | Innovation | Easy | 28 | Name a competitive advantage a new business can build. |
| INO-06 | Innovation | Easy | 33 | Name an emerging technology that is creating new business opportunities. |
| INO-07 | Innovation | Easy | 19 | Name a quality that makes a business idea a real opportunity. |
| FRN-01 | Franchising and Ownership | Medium | 25 | Name a fee or cost a franchisee pays. |
| FRN-02 | Franchising and Ownership | Easy | 22 | Name an advantage of buying a franchise. |
| FRN-03 | Franchising and Ownership | Easy | 20 | Name a disadvantage of buying a franchise. |
| FRN-04 | Franchising and Ownership | Hard | 25 | Name an item disclosed in a Franchise Disclosure Document. |
| FRN-05 | Franchising and Ownership | Hard | 18 | Name a factor to weigh when choosing a form of business ownership. |
| FRN-06 | Franchising and Ownership | Medium | 23 | Name something a buyer should examine before buying an existing business. |
| FRN-07 | Franchising and Ownership | Hard | 22 | Name a type of franchise or franchising arrangement. |
| FRN-08 | Franchising and Ownership | Easy | 14 | Name an advantage of a sole proprietorship. |
| GRO-01 | Growth and Exit | Medium | 20 | Name a strategy a business can use to grow. |
| GRO-02 | Growth and Exit | Medium | 14 | Name an exit strategy for a business owner. |
| GRO-03 | Growth and Exit | Hard | 16 | Name a way a business can enter a foreign market. |
| GRO-04 | Growth and Exit | Hard | 19 | Name a method or measure used to value a business that is for sale. |
| GRO-05 | Growth and Exit | Medium | 23 | Name a problem a business can face when it grows quickly. |
| GRO-06 | Growth and Exit | Medium | 28 | Name a challenge a business faces when it expands into another country. |

### Finance

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| FIN-04 | Finance | Hard | 17 | Name a method used to evaluate a capital investment project. |
| FIN-05 | Finance | Easy | 31 | Name a career in the finance industry. |
| FIN-06 | Finance | Hard | 23 | Name a term or concept used in time value of money calculations. |
| ACC-04 | Accounting | Medium | 14 | Name an accounting method for valuing inventory or depreciating an asset. |
| ACC-05 | Accounting | Hard | 24 | Name a generally accepted accounting principle or assumption. |
| ACC-06 | Accounting | Medium | 21 | Name a source document used to record a business transaction. |
| ACC-07 | Accounting | Hard | 24 | Name a line or section on a statement of cash flows. |
| PFL-04 | Personal Financial Literacy | Easy | 19 | Name a tax that an individual or household may have to pay. |
| PFL-05 | Personal Financial Literacy | Easy | 22 | Name a spending or saving category in a personal or household budget. |
| PFL-06 | Personal Financial Literacy | Medium | 28 | Name a type of financial fraud or scam aimed at consumers. |
| PFL-07 | Personal Financial Literacy | Hard | 23 | Name a U.S. federal law that protects consumers or investors in financial matters. |
| BNK-01 | Banking | Easy | 24 | Name a product or service a retail bank offers its customers. |
| BNK-02 | Banking | Hard | 15 | Name a tool or action the Federal Reserve uses to carry out monetary policy. |
| BNK-03 | Banking | Easy | 18 | Name a way to make a payment without using cash. |
| BNK-04 | Banking | Medium | 17 | Name a fee a bank may charge on a checking or savings account. |
| INV-01 | Investing | Hard | 16 | Name a type of stock order that sets how or when a trade is carried out. |
| INV-02 | Investing | Medium | 22 | Name a type of risk an investor faces. |
| INV-03 | Investing | Easy | 26 | Name a stock market index. |
| INV-04 | Investing | Medium | 28 | Name a stock exchange. |
| INV-05 | Investing | Medium | 25 | Name a type of bond. |
| INS-01 | Insurance | Medium | 38 | Name a key term used in an insurance policy. |
| INS-02 | Insurance | Medium | 14 | Name a type of coverage that can be part of an auto insurance policy. |
| INS-03 | Insurance | Hard | 26 | Name a type of insurance that a business buys to protect itself. |
| INS-04 | Insurance | Easy | 23 | Name a factor an insurer may use to set the price of an auto insurance policy. |
| CRD-01 | Credit | Easy | 27 | Name a type of loan or consumer credit. |
| CRD-03 | Credit | Medium | 22 | Name an item of information found on a credit report. |
| CRD-04 | Credit | Hard | 29 | Name a term or condition spelled out in a loan or credit card agreement. |
| CRD-05 | Credit | Hard | 19 | Name a debt-relief option or arrangement open to a borrower who is struggling to repay. |
| BNK-05 | Banking | Easy | 13 | Name a piece of information printed or written on a personal check. |
| BNK-06 | Banking | Medium | 13 | Name a function of money or a characteristic that makes something work well as money. |
| BNK-07 | Banking | Hard | 16 | Name a function or goal of the Federal Reserve System. |
| INS-05 | Insurance | Easy | 18 | Name a cause of loss that a standard homeowners insurance policy typically covers. |
| INS-06 | Insurance | Hard | 21 | Name a type of life insurance policy. |
| CRD-06 | Credit | Medium | 25 | Name a cost a home buyer pays at or before closing when buying with a mortgage. |
| CRD-07 | Credit | Hard | 22 | Name a type of mortgage. |
| INV-06 | Investing | Medium | 26 | Name a type of retirement or tax-advantaged savings account or plan. |
| INV-07 | Investing | Medium | 11 | Name a sector of the stock market. |
| FIN-07 | Finance | Hard | 17 | Name a type of financial market. |
| FIN-08 | Finance | Hard | 25 | Name a type of budget a business prepares. |
| PFL-08 | Personal Financial Literacy | Easy | 20 | Name a source of income for an individual or household. |
| ACC-08 | Accounting | Medium | 19 | Name a branch or specialized field of accounting. |

### Hospitality + Tourism

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| HT-04 | Hospitality and Tourism | Easy | 36 | Name an amenity a hotel may offer its guests. |
| HT-05 | Hospitality and Tourism | Easy | 20 | Name a step an employee should take when handling a guest complaint. |
| HT-06 | Hospitality and Tourism | Medium | 25 | Name a factor outside a business that can raise or lower demand for travel. |
| HT-07 | Hospitality and Tourism | Medium | 18 | Name a way a hotel or restaurant gathers feedback from its guests. |
| LDG-01 | Lodging | Easy | 29 | Name a type of hotel guest room. |
| LDG-02 | Lodging | Easy | 33 | Name a job position in a hotel. |
| LDG-03 | Lodging | Hard | 24 | Name a metric a hotel uses to measure its performance. |
| LDG-04 | Lodging | Medium | 25 | Name a task carried out at a hotel front desk. |
| LDG-05 | Lodging | Hard | 28 | Name a type of room rate a hotel may offer. |
| LDG-06 | Lodging | Medium | 23 | Name a benefit a hotel loyalty program gives its members. |
| LDG-07 | Lodging | Hard | 25 | Name a room status term used by hotel housekeeping and the front desk. |
| LDG-08 | Lodging | Easy | 23 | Name a task the housekeeping department carries out in a hotel. |
| LDG-09 | Lodging | Hard | 28 | Name a market segment of guests that a hotel targets. |
| RFS-01 | Restaurants and Food Service | Easy | 28 | Name a type of restaurant, classified by its service style or format rather than its cuisine. |
| RFS-02 | Restaurants and Food Service | Medium | 24 | Name a kitchen (back-of-house) position in a restaurant. |
| RFS-03 | Restaurants and Food Service | Easy | 25 | Name a front-of-house position in a restaurant. |
| RFS-04 | Restaurants and Food Service | Medium | 30 | Name a type of menu. |
| RFS-05 | Restaurants and Food Service | Hard | 22 | Name a style of food service a restaurant or caterer can use. |
| RFS-06 | Restaurants and Food Service | Easy | 28 | Name a practice that keeps food safe in a commercial kitchen. |
| RFS-07 | Restaurants and Food Service | Hard | 32 | Name a cost or metric a restaurant manager tracks. |
| RFS-08 | Restaurants and Food Service | Medium | 9 | Name one of the nine major food allergens that U.S. food businesses must watch for. |
| RFS-09 | Restaurants and Food Service | Hard | 26 | Name a way a restaurant keeps its food cost percentage under control. |
| TRV-01 | Travel and Tourism | Easy | 27 | Name a type of tourism, classified by the purpose of the trip. |
| TRV-02 | Travel and Tourism | Hard | 15 | Name a travel intermediary that sells, packages or distributes travel. |
| TRV-03 | Travel and Tourism | Easy | 22 | Name a mode of transportation travelers use. |
| TRV-04 | Travel and Tourism | Medium | 26 | Name a tool or tactic a destination uses to market itself to visitors. |
| TRV-05 | Travel and Tourism | Medium | 25 | Name a practice a hotel or destination can adopt to make tourism more sustainable. |
| TRV-06 | Travel and Tourism | Hard | 22 | Name a source of ancillary revenue for an airline beyond the base ticket price. |
| TRV-07 | Travel and Tourism | Easy | 27 | Name a type of visitor attraction. |
| TRV-08 | Travel and Tourism | Easy | 21 | Name a document a traveler may need for an international trip. |
| EVT-01 | Events | Easy | 32 | Name a type of event a planner might organize. |
| EVT-02 | Events | Medium | 31 | Name something an event planner must arrange when planning an event. |
| EVT-03 | Events | Easy | 29 | Name a type of event venue. |
| EVT-04 | Events | Hard | 18 | Name a room seating layout used for a meeting or event. |
| EVT-05 | Events | Medium | 29 | Name a vendor or professional an event planner hires for an event. |
| EVT-06 | Events | Easy | 25 | Name a risk an event planner should prepare for. |
| EVT-07 | Events | Medium | 24 | Name a measure used to judge whether an event was a success. |
| EVT-08 | Events | Hard | 26 | Name a clause or term commonly found in a contract between an event planner and a venue. |
| SPE-01 | Sports and Entertainment | Easy | 20 | Name a revenue stream for a professional sports team. |
| SPE-02 | Sports and Entertainment | Hard | 26 | Name a right or asset a team or event can include in a sponsorship package for a company. |
| SPE-03 | Sports and Entertainment | Medium | 26 | Name a type of ticket or ticket package a team or venue sells. |
| SPE-04 | Sports and Entertainment | Easy | 28 | Name a category of licensed merchandise a team or entertainment brand sells. |
| SPE-05 | Sports and Entertainment | Medium | 26 | Name a promotion a team uses to boost attendance at games. |
| SPE-06 | Sports and Entertainment | Hard | 20 | Name a type of property whose name or image is licensed for use on merchandise. |
| SPE-07 | Sports and Entertainment | Easy | 32 | Name a career in the sports industry other than professional athlete. |
| SPE-08 | Sports and Entertainment | Medium | 19 | Name a way a professional athlete or entertainer earns income. |
| SPE-09 | Sports and Entertainment | Hard | 17 | Name a source of revenue for a movie studio from a film it releases. |

### Marketing

| Id | Topic | Difficulty | Answers | Prompt |
|---|---|---|---|---|
| MKT-07 | Marketing | Easy | 22 | Name a cultural, social, personal or psychological factor that influences consumer buying behavior. |
| MKT-08 | Marketing | Medium | 20 | Name a section of a marketing plan. |
| MKT-09 | Marketing | Hard | 18 | Name a category used to classify consumer or business products. |
| MKT-11 | Marketing | Medium | 14 | Name a demographic variable used to segment a consumer market. |
| SEL-04 | Professional Selling | Hard | 11 | Name a specialized method a salesperson can use to answer a customer objection. |
| SEL-05 | Professional Selling | Medium | 20 | Name a way a salesperson can find new prospects. |
| SEL-06 | Professional Selling | Easy | 22 | Name a way a business keeps customers coming back after the sale. |
| SEL-07 | Professional Selling | Medium | 22 | Name a type of sales job or salesperson. |
| SEL-08 | Professional Selling | Easy | 19 | Name a source a salesperson can use to build product knowledge. |
| PROM-01 | Promotion | Easy | 21 | Name an advertising medium. |
| PROM-02 | Promotion | Medium | 23 | Name a sales promotion tool. |
| PROM-03 | Promotion | Medium | 21 | Name a public relations tool. |
| PROM-04 | Promotion | Hard | 24 | Name a metric used to measure digital marketing results. |
| PROM-05 | Promotion | Medium | 19 | Name an element of visual merchandising. |
| PROM-06 | Promotion | Hard | 20 | Name a type of advertising, classified by its purpose or sponsor. |
| PROM-07 | Promotion | Medium | 15 | Name a part of a print advertisement. |
| PRC-01 | Pricing | Easy | 20 | Name a factor that affects the price a business sets. |
| PRC-02 | Pricing | Medium | 16 | Name a goal a business may be trying to reach through its pricing. |
| PRC-03 | Pricing | Medium | 24 | Name a type of discount or allowance a seller offers to buyers. |
| PRC-04 | Pricing | Hard | 11 | Name a pricing practice that laws restrict or prohibit. |
| PRC-05 | Pricing | Medium | 20 | Name a term used in retail pricing math, the calculations a store uses to set and change its selling prices. |
| PRC-06 | Pricing | Easy | 17 | Name a reason a retailer would mark down the price of an item. |
| CHN-01 | Channels | Easy | 25 | Name a type of retailer. |
| CHN-02 | Channels | Medium | 13 | Name an activity that is part of physical distribution. |
| CHN-03 | Channels | Hard | 21 | Name a type of wholesaler or agent intermediary. |
| CHN-04 | Channels | Hard | 18 | Name a job that intermediaries perform for producers in a distribution channel. |
| CHN-05 | Channels | Hard | 17 | Name a distribution strategy or type of channel arrangement a producer can use. |
| CHN-06 | Channels | Medium | 18 | Name a type of shopping center or retail store location. |
| MKR-01 | Market Research | Easy | 13 | Name a method of collecting primary market research data. |
| MKR-02 | Market Research | Medium | 17 | Name a source of secondary market research data. |
| MKR-03 | Market Research | Medium | 15 | Name a step in the marketing research process. |
| MKR-04 | Market Research | Hard | 13 | Name a sampling method used in research. |
| MKR-05 | Market Research | Medium | 15 | Name a type of question used on a market research survey. |
| MKR-06 | Market Research | Hard | 19 | Name a source of error or bias that can make survey results unreliable. |
| MKR-07 | Market Research | Easy | 21 | Name a kind of information a business keeps about a customer in a customer relationship management (CRM) database. |
| BRD-01 | Branding | Easy | 18 | Name an element of a brand. |
| BRD-02 | Branding | Hard | 19 | Name a branding strategy or type of brand. |
| BRD-03 | Branding | Easy | 13 | Name a job that packaging does for a product. |
| BRD-04 | Branding | Medium | 17 | Name a basis a company can use to position a product in the minds of customers. |
| BRD-05 | Branding | Easy | 23 | Name a piece of information found on a product label. |
| BRD-06 | Branding | Hard | 12 | Name a level of brand familiarity or a component of brand equity. |

## Wider answer boards (second pass)

After players reported that plausible answers were not accepted, every board was widened: more correct answers at each
level and more accepted wordings for each answer. The bank went from 3,447 answers and about 8,400 accepted wordings to
5,422 answers and about 33,400. This pass was done by one AI agent per cluster with a self-review; it was not
fact-checked by a second agent or by a person. All earlier wordings still score at the same level, apart from three
rows that were split on purpose (Server / Bartender, Baker / Pastry chef, Wine list / Drink menu).

Points the agents flagged as the least certain additions:

### Business Management + Administration

- POB-02: Buying, Risk taking and Standardizing and grading added at level 6, from the classic eight-function list rather than the seven usually taught.
- ECO-01: Human capital is its own level 5 row; some texts fold it into labor or capital.
- LAW-02: Non-disclosure agreement at level 5 is a contract protection, not an intellectual property right.
- LAW-05: Strict liability split from Product liability; Wrongful termination and Infringement accepted as business torts.
- POB-05: "monopoly" accepted under Monopolizing; bare "dumping" means illegal waste dumping, the trade sense needs "product dumping".
- HRM-06: Layoff or plant closing threats, Lobbying, and Yellow-dog contract / blacklisting (historical, now illegal) accepted as tactics.
- ECO-07, BA-05, LAW-04: level 6 is large (12 to 19 answers); some could be moved to level 5.

### Entrepreneurship

- SBM-05: Inventory purchases (with "cost of goods sold") and Loan payments (with "interest") accepted as operating expenses; strict accounting excludes both.
- INO-06: Social media and e-commerce accepted as emerging technology.
- GRO-01: Government contracting, and Increasing capacity with the alias "hiring", are the weakest growth strategies kept.
- GRO-02: Bankruptcy accepted as a last-resort exit.
- ENT-05: Fabian, Drone, Hustler, Researcher, Necessity and Opportunity entrepreneur come from classifications not every curriculum uses.
- SBM-02, INO-01, FRN-07, INO-06: level 6 is crowded (10 to 13 answers).

### Finance

- ACC-05: Comparability, Relevance, Reliability, Timeliness and Understandability are qualitative characteristics, not principles in the strict sense; Regularity, Sincerity, Non-compensation and Utmost good faith come from a popular "10 principles" list, not from FASB.
- FIN-01: Savings account and Retirement account accepted as investments.
- INS-05: Injury to a guest accepted as a covered cause of loss.
- BNK-03: Barter and Store credit or rewards points at level 6; Buy now pay later at level 5.
- CRD-07: Refinance loan and Seller financing accepted as mortgage types.
- INV-04: Cboe accepted as a stock exchange.
- PFL-04: Tariff or customs duty accepted as a tax an individual may pay.
- ACC-08: Budgeting and Consulting accepted as fields of accounting.
- PFL-01: Medicare and Medicaid accepted as Health insurance.

### Hospitality + Tourism

- TRV-02: Central reservation system and Meeting planner accepted as travel intermediaries.
- TRV-06: cargo and freight are deliberately not accepted as airline ancillary revenue.
- RFS-08: "gluten" is not accepted for Wheat, nor "lactose" for Milk.
- RFS-04: "fixed menu" now means Static menu; "fixed price menu" still means Prix fixe.
- LDG-02: some aliases are neighbouring jobs rather than exact synonyms (night manager under Night auditor, barista under Bartender).
- HT-03: Adventure, Cultural and Medical tourism added as industry segments.
- LDG-01: Hollywood twin, Lanai, Cabana and Efficiency added at level 6.
- EVT-05: Venue accepted as a vendor.

### Marketing

- PRC-04: Hidden fees (drip pricing, junk fees) accepted as a restricted practice; it rests on recent rules, not older textbooks.
- MKR-01: Website analytics accepted as primary data.
- BRD-01: Brand story, Brand values and Spokesperson accepted as brand elements.
- MKT-02: Usage rate, Benefits sought, Brand loyalty and Occasion are separate rows although they are kinds of behavioral segmentation.
- SEL-02: Service close, Minor points close and Testimonial close come from specific textbooks.
- CHN-06: Flea market and Festival marketplace are loose fits for a type of shopping center.
- MKR-06: "response bias" accepted under Dishonest answers and "margin of error" under Sampling error.

## Definitions (third pass)

Every answer now has a short definition in `lib/questions/defs/`, shown when a player opens an answer in the round
review, the training log or the study list: 5,422 in all. Each cluster's definitions were written by one AI agent and
then checked by a second, which changed 84 of them. Most changes were precision or wording; the real errors fixed
included the explanation of home equity, a depreciation formula, and a handwashing time. No person has checked them.

Writing a definition is a good test of whether an answer belongs on its board. The writers flagged the entries below as
not really fitting their prompt, or as having accepted wordings that mean something different. The definitions were
written to be accurate rather than to defend the entry, so some of them say the answer is a loose fit.

### Business Management + Administration

- LAW-02 Non-disclosure agreement: a contract, not a type of intellectual property protection.
- LAW-04 Taft-Hartley Act mainly restricts unions; Whistleblower Protection Act covers federal employees only; Social Security Act and Consumer Credit Protection Act are only loosely worker-protection laws.
- ECO-05 Boycott and Currency devaluation are not classic government trade barriers.
- ECO-04 Postal service is funded mostly by postage, not taxes.
- POB-05 Breach of contract, Planned obsolescence and Conflict of interest: a civil wrong, a usually legal practice, and a situation rather than a practice.
- HRM-05 Raise is an increase in pay, not a form of pay; Stock options also sits on HRM-01 as a benefit.
- POB-02 Buying, Risk taking, Standardizing and grading, Financing come from older lists of eight or nine functions, while the prompt's explanation says seven.
- ECO-01 Human capital, Technology, Knowledge are not among the standard four factors.
- BMA-03 Centralized / Decentralized describe where decisions are made, not structure types.
- OPM-04 Last in first out and Weighted average cost are accounting valuation methods.
- Accepted wordings that mean something else: "deficit" for National debt and "employment rate" for Unemployment rate (ECO-03); "collective mark" for Certification mark (LAW-02); "epa" for Equal Pay Act (LAW-04); "web browser" for Website (BA-04); "g8" for G7 (ECO-07); "jit" for Job instruction training (HRM-02); "benefit corporation" for B Corp certification (POB-07).

### Entrepreneurship

- SBM-05 Inventory purchases, Loan payments and the broad alias "taxes" on Property taxes are not operating expenses in the accounting sense.
- INO-01 Five whys is a problem-diagnosis tool, not an idea-generation technique; Value analysis and Delphi method are listed as creativity techniques in only some textbooks.
- INO-02 Business model canvas is not a lean startup concept as such.
- FND-04 Convertible note, Bonds, Promissory note are loose as types of small business loan.
- FND-05 Return on investment, Pitch deck, Accelerator are general terms, not deal terms.
- GRO-04 Growth rate, Return on investment, Goodwill and intangibles are inputs to a valuation, not methods.
- ENT-07 Job security is debatable as an advantage of entrepreneurship.
- FRN-01 Rent, Payroll, Utilities, Taxes, Inventory are ordinary business costs, not franchise fees.
- ENT-05 Hustler and Researcher entrepreneur come from web lists, not textbooks.
- Accepted wordings that mean something else: "llp" for Limited partnership and "limited liability corporation" for LLC (ENT-01); "incubator" for Accelerator (ENT-02); "tag along" for Drag-along rights (FND-05); "customer satisfaction" for Net promoter score and "net income" for Profit margin (FND-06); "board of directors" for Advisory board (SUP-06).

### Finance

- ACC-05 Regularity, Sincerity, Non-compensation, Utmost good faith come from a popular web list, not the official accounting framework. They are the weakest entries in the cluster.
- INS-05 Injury to a guest is liability coverage, not a cause of property loss.
- BNK-03 Barter involves no payment; Store credit or rewards points is loose.
- BNK-02 Margin requirements and Moral suasion are not normally counted as monetary policy tools.
- PFL-04 Tariff is paid by importers and Value-added tax is not a United States tax.
- ACC-08 Bookkeeping, Budgeting, Consulting are activities rather than branches of accounting.
- FIN-04 Return on investment, Cost-benefit analysis, Feasibility study, Break-even analysis are general evaluation tools, not capital budgeting methods.
- FIN-01 Savings account is a stretch as an investment; FIN-03 Pawnshop and Check-cashing service are loose as financial institutions.
- INV-04 NYSE Chicago was renamed NYSE Texas in 2025 (from the checking agent's memory, not looked up). "nyse texas" is now accepted; the displayed name is unchanged.
- PFL-03 Withholding allowances: the current federal form no longer uses allowances.
- BNK-02 Reserve requirements: the definition and the prompt's explanation say the requirement is currently zero, which will need updating if that changes.

### Hospitality + Tourism

- LDG-07 No-show is a reservation status, not a room status.
- TRV-02 Central reservation system is a hotel chain's own system, not an intermediary; Meeting planner is a buyer rather than a distributor.
- HT-01 Valet is a job, not a department; Rooms division contains three other entries on the same board.
- LDG-01 Smoking or non-smoking room is an attribute, not a room type.
- RFS-03 Delivery driver, Valet, Bouncer are not classic front-of-house positions.
- LDG-05 Special event rate is usually a premium, not a discount.
- Accepted wordings that mean something else: "net income" and "ebitda" for Gross operating profit, "booking window" for Booking pace and "no-show rate" for Cancellation rate (LDG-03); "english service" for Family-style service and "silver service" for Russian service (RFS-05); "brewery" for Pub and "food court" for Food hall (RFS-01); "expansion fees" for Revenue sharing (SPE-01).

### Marketing

- MKT-01 Packaging and Positioning are not in the standard four or seven Ps.
- MKT-03 Social media, Influencer marketing, Visual merchandising are channels or tactics, not promotional-mix elements.
- SEL-01 Negotiation, Qualifying, Suggestion selling are not in the standard steps of a sale.
- SEL-03 Competitor, Authority, Hidden objection sit outside the classic five objection types the prompt's explanation cites.
- PROM-02 Product placement, Sponsorship, Trade shows are usually classed under other parts of the promotional mix.
- PRC-05 Profit and Break-even point are not really retail pricing math terms.
- MKR-05 Net promoter score is a metric, not a question type.
- Several boards list a category alongside its own members: MKT-09, CHN-05, MKR-04, MKR-05, CHN-01.
- Accepted wordings that conflict across boards: "price discrimination" is a strategy on MKT-04 and a restricted practice on PRC-04; "loss leader" is a strategy on MKT-04 and a restricted practice on PRC-04.
- Accepted wordings that mean something else: "paying in cash" for Cash discount (PRC-03); "variety store" for Dollar store (CHN-01); "brand identity" for Brand associations (BRD-06).
