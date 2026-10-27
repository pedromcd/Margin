export const demoText = `An algorithm is a finite sequence of well-defined instructions for solving a problem.
A stack follows the last-in, first-out (LIFO) principle.
A queue follows the first-in, first-out (FIFO) principle.
Binary search repeatedly halves a sorted search space.
Binary search requires the input data to be sorted.
A primary key uniquely identifies each row in a relational database table.
A foreign key references a key in another table and supports referential integrity.
Encapsulation groups data and the methods that operate on that data within a single unit.
A unit test checks the behavior of a small, isolated piece of code.
Version control records changes to files over time so that specific versions can be recalled later.`;
export function extract(text, sourceId) {
 return text.split(/\n+/).map(s=>s.trim()).filter(s=>s.length>20).slice(0,40).map((excerpt,i)=>({id:crypto.randomUUID(),sourceId,excerpt,question:`Explain: ${excerpt.split(/\s+/).slice(0,3).join(' ')}…`,answer:excerpt,tags:['Key concept'],kind:'Concept',status:'pending',origin:'Extractive draft',reviews:0,correct:0,due:0,createdAt:Date.now()+i}));
}
export function validateDrafts(items,text,sourceId) {
 if(!Array.isArray(items)||items.length>40) throw Error('Invalid extraction response.');
 return items.map(x=>{if(typeof x.excerpt!=='string'||!text.includes(x.excerpt)||!x.excerpt.trim()||typeof x.question!=='string'||typeof x.answer!=='string'||!x.question.trim()||!x.answer.trim()) throw Error('A generated item could not be traced to the source.'); return {...extract(x.excerpt,sourceId)[0],id:crypto.randomUUID(),sourceId,excerpt:x.excerpt,question:x.question.slice(0,600),answer:x.answer.slice(0,2000),tags:Array.isArray(x.tags)?x.tags.filter(t=>typeof t==='string').slice(0,5):[],kind:['Concept','Process','How-to','Open question'].includes(x.kind)?x.kind:'Concept',origin:'AI interpretation',status:'pending',reviews:0,correct:0,due:0};});
}
export function reviewed(card,correct,now=Date.now()){const streak=correct?(card.streak||0)+1:0; return {...card,reviews:card.reviews+1,correct:card.correct+Number(correct),streak,due:now+(correct?Math.min(30,2**(streak-1))*86400000:600000)};}
export function initialDemo(){const source={id:crypto.randomUUID(),title:'Computer Science · Foundations',text:demoText,createdAt:Date.now()};const cards=extract(demoText,source.id);const qs=['What is an algorithm?','Which principle does a stack follow?','Which principle does a queue follow?','How does binary search reduce its search space?','What must be true of binary search input?','What does a primary key identify?','What is the purpose of a foreign key?','What does encapsulation group together?','What does a unit test check?','What does version control record?'];cards.forEach((c,i)=>{c.question=qs[i];c.status=i<4?'approved':'pending'});return {sources:[source],cards,sessions:[]};}
