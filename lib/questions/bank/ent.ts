/* Entrepreneurship prompts. Data only. The format is described in lib/questions/index.ts. */
import type { Question } from "@/types";

export const ENT: Question[] = [
// ---------------- Entrepreneurship ----------------
{id:'ENT-01',cluster:'ent',topic:'Entrepreneurship',area:'Entrepreneurship',diff:1,q:'Name a form of business ownership.',
 why:'The form of ownership decides who is liable and how profits are taxed. A B corporation is certified for social and environmental performance.',
 a:[['Sole proprietorship',1,'sole proprietor','proprietorship'],['Corporation',1,'c corporation','c corp','inc'],['Partnership',2,'general partnership'],['LLC',2,'limited liability company','limited liability corporation'],
 ['Franchise',3],['Nonprofit',3,'non profit','nonprofit corporation','not for profit'],['S corporation',4,'s corp'],['Cooperative',4,'co-op','coop'],['Limited partnership',5,'lp','llp','limited liability partnership'],['Joint venture',5],['B corporation',6,'b corp','benefit corporation']]},
{id:'ENT-02',cluster:'ent',topic:'Entrepreneurship',area:'Entrepreneurship',diff:2,q:'Name a way to fund a startup.',
 why:'Founders choose between debt, equity and their own money. Revenue-based financing is repaid as a percentage of monthly sales.',
 a:[['Bank loan',1,'loan','loans','business loan'],['Personal savings',1,'savings','own money'],['Venture capital',2,'vc','investors'],['Crowdfunding',2,'kickstarter','gofundme'],['Angel investor',3,'angel investors','angels'],['Friends and family',3,'family','family and friends'],
 ['Bootstrapping',3,'bootstrap'],['Grants',4,'grant'],['SBA loan',4,'small business administration loan'],['Credit cards',4,'credit card'],['Accelerator',5,'incubator','startup accelerator'],['Initial public offering',5,'ipo'],['Convertible note',6],['Revenue-based financing',6,'revenue based financing']]},
{id:'ENT-03',cluster:'ent',topic:'Entrepreneurship',area:'Entrepreneurship',diff:2,q:'Name a section of a business plan.',
 why:'A business plan sells the idea and proves the numbers. The appendix holds the supporting documents lenders ask for.',
 a:[['Executive summary',1],['Financial plan',2,'financials','financial projections','financial statements'],['Marketing plan',2,'marketing','marketing strategy'],['Company description',3,'business description'],['Market analysis',3],['Products and services',3,'product','products','services'],
 ['Operations plan',4,'operations'],['Management team',4,'management','organization and management','organization'],['Competitive analysis',4,'competition'],['Mission statement',4,'mission'],['SWOT analysis',5,'swot'],['Funding request',5],['Appendix',6]]},
];
