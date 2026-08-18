import { useEffect,useState } from 'react';import { Link,useParams } from 'react-router-dom';import { api } from '../lib/api';import type { LearningPath,Note,PracticeTask } from '../types';const template=`# Topic notes

## Why this matters

## Mental model

## Key concepts

## Commands / syntax

## Worked example

## Pitfalls / debugging

## Practice I completed

## Recall questions
- Q:

## 5-line summary
1.
2.
3.
4.
5.`;export function TopicPage(){const{pathId,topicId}=useParams();const[path,setPath]=useState<LearningPath|null>(null),[notes,setNotes]=useState<Note[]>([]),[tasks,setTasks]=useState<PracticeTask[]>([]),[content,setContent]=useState(template),[taskTitle,setTaskTitle]=useState(''),[error,setError]=useState('');const topic=path?.topics?.find(t=>t.id===topicId);async function load(){try{const[p,n,t]=await Promise.all([api<LearningPath>(`/learning-paths/${pathId}`),api<Note[]>(`/notes?pathId=${pathId}&topicId=${topicId}`),api<PracticeTask[]>(`/practice?pathId=${pathId}&topicId=${topicId}`)]);setPath(p);setNotes(n);setTasks(t);if(n[0])setContent(n[0].contentMarkdown)}catch(e){setError(e instanceof Error?e.message:'Failed')}}useEffect(()=>{load()},[pathId,topicId]);async function save(){if(notes[0])await api(`/notes/${notes[0].id}`,{method:'PATCH',body:JSON.stringify({contentMarkdown:content})});else await api('/notes',{method:'POST',body:JSON.stringify({pathId,topicId,title:topic?.title??'Topic note',contentMarkdown:content,tags:[]})});load()}async function addTask(e:React.FormEvent){e.preventDefault();await api('/practice',{method:'POST',body:JSON.stringify({pathId,topicId,title:taskTitle,instructions:'',type:'lab'})});setTaskTitle('');load()}async function toggle(t:PracticeTask){await api(`/practice/${t.id}`,{method:'PATCH',body:JSON.stringify({status:t.status==='done'?'todo':'done'})});load()}if(!topic)return <div className="card">{error||'Loading…'}</div>;return <section><div className="breadcrumb"><Link to={`/paths/${pathId}`}>← {path?.title}</Link></div><header className="page-header"><div><div className="eyebrow">TOPIC · {topic.estimatedMinutes} MIN</div><h1>{topic.title}</h1><p>{topic.objective}</p></div></header>{error&&<div className="error">{error}</div>}<div className="study-grid"><article className="card"><div className="card-heading"><div><div className="eyebrow">SMART NOTE</div><h2>Write from memory</h2></div><button onClick={save}>Save note</button></div><textarea className="note-editor" value={content} onChange={e=>setContent(e.target.value)}/><small>Stored as Markdown text.</small></article><aside className="card"><div className="eyebrow">PRACTICE</div><h2>Prove it</h2><form className="stack" onSubmit={addTask}><input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="e.g. break and fix permissions" required/><button>Add lab/task</button></form><div className="task-list">{tasks.map(t=><label className={`task ${t.status==='done'?'done':''}`} key={t.id}><input type="checkbox" checked={t.status==='done'} onChange={()=>toggle(t)}/><span><strong>{t.title}</strong><small>{t.type}</small></span></label>)}</div></aside></div></section>}
