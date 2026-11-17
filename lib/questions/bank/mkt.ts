/* Marketing prompts. Data only. The format is described in lib/questions/index.ts. */
import type { Question } from "@/types";

export const MKT: Question[] = [
// ---------------- Marketing ----------------
{id:'MKT-01',cluster:'mkt',topic:'Marketing',area:'Market Planning',diff:1,q:'Name one of the Ps of the marketing mix.',
 why:'The classic mix is product, price, place and promotion. Services marketing extends it with people, process and physical evidence.',
 a:[['Product',1],['Price',1,'pricing'],['Promotion',2],['Place',3,'distribution','placement'],['People',4],['Packaging',4],['Process',5],['Positioning',5],['Physical evidence',6]]},
{id:'MKT-02',cluster:'mkt',topic:'Marketing',area:'Market Planning',diff:2,q:'Name a way to segment a market.',
 why:'Segmentation splits a market into groups that respond alike. Consumer markets use demographic, geographic, psychographic and behavioral bases; firmographics do the same job for business buyers.',
 a:[['Demographic',1,'demographics','age','income','gender'],['Geographic',2,'geography','location','geographics'],['Psychographic',3,'psychographics','lifestyle'],['Behavioral',4,'behavior','behavioural','behavioristic'],['Generational',4,'generation'],['Technographic',5,'technographics'],['Firmographic',6,'firmographics']]},
{id:'MKT-03',cluster:'mkt',topic:'Marketing',area:'Promotion',diff:2,q:'Name an element of the promotional mix.',
 why:'The promotional mix is the set of tools a business combines to communicate with its market.',
 a:[['Advertising',1,'ads','advertisement'],['Social media',2,'social media marketing','digital marketing'],['Public relations',2,'pr','publicity'],['Sales promotion',3,'sales promotions','coupons'],['Personal selling',4,'selling'],['Direct marketing',4,'direct mail'],['Word of mouth',5],['Sponsorship',6,'sponsorships']]},
{id:'MKT-04',cluster:'mkt',topic:'Marketing',area:'Pricing',diff:2,q:'Name a pricing strategy.',
 why:'Pricing strategies trade off volume, margin and image. Captive product pricing sells the base item cheaply and earns on the required refills.',
 a:[['Discount pricing',1,'discount','discounting','sale pricing'],['Premium pricing',2,'premium'],['Competitive pricing',2,'competition based pricing','competitive','competitor pricing'],['Bundle pricing',2,'bundle','bundling'],
 ['Penetration pricing',3,'penetration'],['Price skimming',3,'skimming','skim pricing'],['Dynamic pricing',3,'dynamic','surge pricing'],['Value-based pricing',3,'value pricing','value based'],
 ['Psychological pricing',4,'psychological'],['Cost-plus pricing',4,'cost plus','markup pricing','cost based pricing'],['Freemium',4],['Loss leader',5,'loss leader pricing'],['Prestige pricing',5,'prestige'],['Price lining',5],
 ['Odd-even pricing',6,'odd even','odd pricing'],['Captive product pricing',6,'captive pricing','captive product']]},
{id:'MKT-05',cluster:'mkt',topic:'Marketing',area:'Product/Service Management',diff:1,q:'Name a stage of the product life cycle.',
 why:'Products move through introduction, growth, maturity and decline. Many models add a development stage before launch.',
 a:[['Growth',1],['Introduction',2,'intro','launch'],['Maturity',2,'mature'],['Decline',3],['Saturation',5],['Development',6,'product development','research and development']]},
{id:'MKT-06',cluster:'mkt',topic:'Marketing',area:'Channel Management',diff:2,q:'Name a member of a distribution channel.',
 why:'Channel members move goods from producer to consumer. A drop shipper sells goods it never physically handles.',
 a:[['Retailer',1,'retail','store'],['Wholesaler',2,'wholesale'],['Manufacturer',2,'producer'],['Consumer',3,'customer','end user'],['Distributor',3],['Agent',4,'broker','agents and brokers'],['Freight forwarder',5,'carrier'],['Drop shipper',6,'dropshipper']]},
// ---------------- Professional Selling ----------------
{id:'SEL-01',cluster:'mkt',topic:'Professional Selling',area:'Selling',diff:2,q:'Name a step in the selling process.',
 why:'The sale starts before the customer arrives. The preapproach is the research a salesperson does on a prospect before first contact.',
 a:[['Closing the sale',1,'close','closing','close the sale'],['Presentation',2,'product presentation','presenting','pitch','sales presentation'],['Prospecting',2,'prospect'],['Approach',3,'approaching the customer','greeting'],['Determining needs',3,'needs assessment','determine needs','identifying needs'],
 ['Handling objections',3,'objections','overcoming objections'],['Follow-up',4,'follow up','relationship building'],['Suggestion selling',5,'suggestive selling','upselling','upsell'],['Qualifying',5,'qualifying leads'],['Preapproach',6,'pre approach']]},
{id:'SEL-02',cluster:'mkt',topic:'Professional Selling',area:'Selling',diff:3,q:'Name a technique for closing a sale.',
 why:'A close asks for the decision. The Ben Franklin close lists reasons for and against on paper so the buyer sees the balance.',
 a:[['Direct close',1,'ask for the sale','direct'],['Assumptive close',2,'assumptive'],['Urgency close',2,'now or never','limited time','urgency'],['Summary close',3,'summary'],['Alternative choice close',3,'either or','choice close','which close','alternative close'],
 ['Trial close',4,'trial'],['Takeaway close',5,'takeaway'],['Puppy dog close',5,'puppy dog'],['Standing room only close',5,'scarcity','standing room only'],['Ben Franklin close',6,'balance sheet close','ben franklin'],['Sharp angle close',6,'sharp angle']]},
{id:'SEL-03',cluster:'mkt',topic:'Professional Selling',area:'Selling',diff:2,q:'Name a type of customer objection.',
 why:'Objections map to the buying decisions: need, product, source, price and time. A source objection is doubt about the company itself.',
 a:[['Price',1,'cost','too expensive','money','budget'],['Need',2,'no need'],['Time',2,'timing','not now'],['Product',3,'quality','features'],['Competitor',4,'competition','already have a supplier'],['Authority',5,'need approval','decision maker'],['Source',6,'company','trust','brand']]},
];
