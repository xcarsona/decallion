/* Hospitality + Tourism prompts. Data only. The format is described in lib/questions/index.ts. */
import type { Question } from "@/types";

export const HT: Question[] = [
// ---------------- Hospitality and Tourism ----------------
{id:'HT-01',cluster:'ht',topic:'Hospitality and Tourism',area:'Operations',diff:1,q:'Name a department in a full-service hotel.',
 why:'Hotels split into guest-facing and back-of-house departments. Revenue management sets room rates day by day to match demand.',
 a:[['Front desk',1,'front office','reception','guest services'],['Housekeeping',1],['Food and beverage',2,'restaurant','f and b','fb','kitchen','room service'],['Concierge',3],['Sales and marketing',3,'sales','marketing'],
 ['Maintenance',4,'engineering'],['Human resources',4,'hr'],['Security',5,'loss prevention'],['Banquets',5,'events','catering'],['Valet',5,'bell staff','bellhop'],['Revenue management',6]]},
{id:'HT-02',cluster:'ht',topic:'Hospitality and Tourism',area:'Product/Service Management',diff:1,q:'Name a type of lodging.',
 why:'Lodging products differ by service level and length of stay. Capsule hotels rent sleeping pods instead of rooms.',
 a:[['Hotel',1],['Motel',1],['Resort',2],['Bed and breakfast',2,'b and b','bnb','b b'],['Hostel',3],['Vacation rental',3,'airbnb','short term rental','vrbo'],['Inn',3],['Campground',4,'camping','campsite'],['Lodge',4],['Boutique hotel',4,'boutique'],
 ['Extended stay',5,'extended stay hotel'],['Timeshare',5],['Glamping',5],['Casino hotel',5,'casino'],['Capsule hotel',6,'pod hotel'],['Ryokan',6]]},
{id:'HT-03',cluster:'ht',topic:'Hospitality and Tourism',area:'Marketing',diff:2,q:'Name a segment of the travel and tourism industry.',
 why:'Tourism is a chain of separate industries. Destination marketing organizations promote a city or region to visitors and conventions.',
 a:[['Lodging',1,'hotels','accommodations','accommodation'],['Airlines',1,'air travel','aviation'],['Food and beverage',2,'restaurants','food service','dining'],['Cruise lines',2,'cruises','cruise'],['Transportation',2],['Attractions',3,'theme parks','amusement parks'],
 ['Recreation',3,'outdoor recreation'],['Travel agencies',3,'travel agents','travel agency'],['Tour operators',4,'tours'],['Meetings and events',4,'events','conventions','meetings'],['Car rental',4,'rental cars'],['Gaming',5,'casinos','gambling'],['Ecotourism',5],['Destination marketing organizations',6,'dmo','convention and visitors bureau','cvb','tourism board']]},
];
