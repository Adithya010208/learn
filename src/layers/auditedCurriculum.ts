import type { GoalId, LearningRoadmap, RoadmapTopic } from '../types/domain.ts';

type StudyModule = readonly [id: string, title: string, coverage: string, practice: string];
type Stage = { title: string; modules: readonly (StudyModule | string)[] };

const gateSource = 'https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/CS_GATE2027_Syllabus.pdf';

const zeroStage = 'Start from zero';

const beginnerModules: Record<GoalId, readonly StudyModule[]> = {
  placement: [
    ['zero-pl-computer', 'What a computer and a program do', 'Input, processing, storage and output; programs and data', 'Pick a calculator or notes app. Write down its input, what it does, and what you see as output.'],
    ['zero-pl-files', 'Files, folders, apps and the terminal', 'File names and paths; opening and saving files; running a command', 'Create a study folder, save a text file, and locate the file from a terminal.'],
    ['zero-pl-debug', 'Read a problem and trace a solution', 'Inputs and outputs; normal examples and edge cases; tracing changes', 'Write instructions for finding the largest of three marks. Trace them when two marks tie.'],
    ['zero-pl-cs-map', 'A first map of software, memory and data', 'Running programs and memory; saved storage; tables and requests', 'Draw where an unsaved note and a saved note might be stored. Explain the difference in your own words.'],
  ],
  dsa_cp: [
    ['zero-dsa-first-program', 'Run your first Java program', 'JDK 21; Main.java; main method; compile and run; console output', 'Save class Main with public static void main(String[] args). Print your name and 2 + 3 with System.out.println. Compile with javac Main.java and run with java Main.'],
    ['zero-dsa-values', 'Java variables, numbers and text', 'int, double, boolean and String; assignment; arithmetic and comparisons', 'Store two marks in variables, calculate their average and print it with a label.'],
    ['zero-dsa-conditions', 'Make decisions with Java if and else', 'Boolean expressions; Java if/else syntax; boundary values', 'Print whether a mark passes a threshold. Try a mark just below, at and above the threshold.'],
    ['zero-dsa-loops', 'Repeat a step with a Java loop', 'Java for and while; loop state; off-by-one mistakes; tracing by hand', 'Print 1 through 5 and calculate their sum. Trace how the counter and total change.'],
    ['zero-dsa-functions', 'Read and write a Java method', 'static methods; parameters and return types; examples and tests', 'Write a function that returns the larger of two numbers and test equal inputs.'],
    ['zero-dsa-arrays', 'Read your first Java array', 'int[]; zero-based indices; .length; empty arrays', 'Make a list of three scores. Print the first and last scores and explain what happens with an empty list.'],
  ],
  gate_cse: [
    ['zero-gate-numbers', 'Refresh basic arithmetic', 'Signed numbers; fractions; ratios and percentages; order of operations', 'Calculate a percentage change and explain how to handle a negative sign in a bracketed expression.'],
    ['zero-gate-algebra', 'Read algebraic expressions and equations', 'Variables; substitution; equality; simple equations', 'Solve 2x + 3 = 11, then substitute the answer back into the original equation.'],
    ['zero-gate-sets', 'Read set notation', 'Elements and membership; empty set; union and intersection', 'Draw two overlapping sets with three items each and list the union and intersection.'],
    ['zero-gate-statements', 'Decide whether a statement is true or false', 'Statements; truth values; AND, OR and NOT in everyday language', 'Translate two everyday rules into simple AND, OR or NOT statements and try one example for each.'],
  ],
  fullstack: [
    ['zero-fs-browser', 'What a browser does', 'Web pages and URLs; browser versus editor; local files and hosted pages', 'Open a web page and identify its address, tab title and visible content.'],
    ['zero-fs-files', 'Create a project folder and open it in an editor', 'Project folders; file extensions; saving and opening a local page', 'Create a folder with index.html, save it as a plain text file and open it in your browser.'],
    ['zero-fs-first-html', 'Write and open your first HTML page', 'Document structure; tags; headings and paragraphs', 'Create a page with a title, one heading and one paragraph. Change the heading, save and reload.'],
    ['zero-fs-first-css', 'Give your page a simple style', 'Selectors and declarations; color; spacing; stylesheet links', 'Link a stylesheet and change the paragraph color and page spacing. Check the page at a narrow width.'],
    ['zero-fs-first-js', 'Run a line of browser JavaScript', 'Script files; values and variables; console output; reading an error', 'Link a script and print a message in the browser console. Change the message and reload.'],
  ],
  cybersecurity: [
    ['zero-cyber-assets', 'Identify what needs protection', 'Devices; accounts; personal information; availability of a service', 'List the assets in a fictional school account and describe what losing each one would mean.'],
    ['zero-cyber-accounts', 'Understand accounts, passwords and MFA', 'Identity; permissions; unique passwords; second factors', 'Compare the roles of a password and MFA, then draft a safety checklist for a fictional user.'],
    ['zero-cyber-web', 'Recognize a website and a network connection', 'Domains; browser addresses; HTTPS indicators; requests and responses', 'Label the scheme and domain in three example URLs and explain what HTTPS protects in transit.'],
    ['zero-cyber-updates', 'Start with updates and recovery', 'Software updates; backups; restoring a copy; device ownership and permission', 'Write a basic protection and recovery plan for a fictional lost laptop.'],
  ],
  ai_ml: [
    ['zero-ml-data', 'Know what data, an input and a prediction are', 'Rows and columns; inputs and outputs; examples and labels', 'Make a five-row table about fictional study sessions. Choose one column you could try to predict.'],
    ['zero-ml-python', 'Run your first Python notebook cell', 'Cells and outputs; print; simple arithmetic; restarting a notebook', 'Print a message and compute 2 + 3 in a notebook. Change the result by editing the expression.'],
    ['zero-ml-values', 'Use Python variables and lists', 'Assignment; numbers and strings; list indexing and length', 'Store three numbers in a list, print the first item and calculate the total.'],
    ['zero-ml-graphs', 'Read a small table and graph', 'Mean and range; axes and scale; comparing values', 'Plot five values by hand, calculate their mean, and identify which value is farthest from it.'],
  ],
  japanese: [
    ['zero-jp-sounds', 'Listen to the five Japanese vowel sounds', 'あ, い, う, え and お; matching one sound to one symbol', 'Play a beginner pronunciation recording and point to the vowel symbol you hear.'],
    ['zero-jp-first-kana', 'Read and write your first five hiragana', 'Recognizing and writing あ, い, う, え and お', 'Copy each character, then read a shuffled list aloud. Check the sounds with a recording.'],
    ['zero-jp-greetings', 'Say hello and thank you', 'こんにちは; ありがとう; recognizing an everyday greeting', 'Listen to each expression, repeat it, and choose which one fits two simple situations.'],
  ],
  english: [
    ['zero-en-first-sentence', 'Say your name and one thing about yourself', 'I am; my name is; common words about home and study', 'Say three short sentences about yourself aloud and record a second attempt.'],
    ['zero-en-simple-actions', 'Say what you do every day', 'Common verbs; simple present; I study and I like', 'Say or write four sentences about your day using four different verbs.'],
    ['zero-en-first-question', 'Ask and answer a short question', 'What and where questions; short answers; asking for repetition', 'Ask two everyday questions and answer them. Practice saying “Could you say that again?”'],
    ['zero-en-first-listening', 'Understand the main point of a short recording', 'Recognizing familiar words; listening twice; using a transcript to check', 'Listen to a short beginner recording, note three words, and check what you heard against the transcript.'],
  ],
};

const curriculum: Record<GoalId, readonly Stage[]> = {
  placement: [
    { title: 'CS foundations', modules: [
      'pl-cs-foundations-scratch',
      ['pl-tools-oop', 'Developer tools and object-oriented programming', 'Git branches and reviews; classes and interfaces; composition; unit testing', 'Build and test a small library inventory with separate domain and storage interfaces.'],
      ['pl-dbms-core', 'Relational database fundamentals', 'ER modeling; keys and constraints; joins and aggregation; normalization', 'Design a course-registration schema and write queries for enrollment and waitlists.'],
      ['pl-sql-practice', 'SQL joins and grouped queries', 'INNER JOIN, LEFT JOIN, GROUP BY and HAVING', 'Using students and enrollments tables, report each student and their enrollment count. Include students with zero enrollments.'],
      'pl-dbms-indexing',
      ['pl-os-core', 'Operating systems fundamentals', 'Processes and threads; context switches; scheduling; synchronization; deadlock; files', 'Trace two threads sharing a counter and explain how a lock changes the trace.'],
      'pl-os-virtual-memory',
      ['pl-networking', 'Networking fundamentals', 'DNS; IP routing; TCP and UDP; HTTP and TLS; latency and throughput', 'Draw what happens from entering a URL to receiving a response.'],
    ] },
    { title: 'Engineering and interviews', modules: [
      ['pl-software-engineering', 'Software engineering practice', 'Requirements; modularity; testing; debugging; code review; CI', 'Turn a feature request into acceptance criteria, tests and a review checklist.'],
      ['pl-system-design', 'Junior system design', 'API contracts; storage choice; caching; reliability; observability', 'Sketch a service for a college event, estimate its load and defend a storage choice.'],
      ['pl-aptitude', 'Placement aptitude and reasoning', 'Arithmetic; data interpretation; logic; timed accuracy', 'Complete a timed mixed set and classify the mistakes.'],
      ['pl-coding-interview', 'Coding interview practice', 'Clarification; examples and edge cases; baseline and optimized solutions; complexity', 'Solve an unfamiliar DSA problem aloud and test the result with three cases.'],
      ['pl-resume', 'Résumé and portfolio evidence', 'Project summaries; reproducibility; measurable results; role relevance', 'Write two evidence-backed résumé bullets and add run instructions to a project.'],
      ['pl-mock', 'Technical and behavioral mock interviews', 'CS oral review; STAR; project walkthrough; company-specific research', 'Run a mock interview and turn each weak answer into a follow-up practice task.'],
    ] },
  ],
  dsa_cp: [
    { title: 'Programming and sequences', modules: [
      'dsa-basics-arrays-complexity',
      ['dsa-arrays-strings', 'Arrays, strings and prefix sums', 'Indexing; traversal; frequency counting; prefix sums; edge cases', 'Compute range sums and test single-element and full-array queries.'],
      ['dsa-search-sort', 'Searching and sorting', 'Linear and binary search; invariants; insertion and merge sort; complexity', 'Implement lower bound and test duplicates, missing values and empty input.'],
      ['dsa-hash', 'Hash maps and sets', 'Membership; counting; collisions conceptually; expected complexity', 'Solve two-sum and explain which information the map stores.'],
      ['dsa-lists-stacks-queues', 'Linked lists, stacks, queues and deques', 'Pointer changes; LIFO and FIFO; deque operations; monotonic stack', 'Reverse a list and implement a queue with two stacks.'],
      ['dsa-window-basics', 'Two pointers and sliding-window fundamentals', 'Fixed and variable windows; invariants; valid shrink conditions', 'Compare brute force and window solutions for a non-negative fixed-window sum.'],
      'dsa-sliding-window-monotonic',
      ['dsa-checkpoint-java', 'Independent Java DSA checkpoint', 'Arrays, maps, search and windows; correctness and complexity', 'Without hints, solve one array or map problem in Java in 20 minutes. Hand-test three edge cases and record a mistake or improvement.'],
    ] },
    { title: 'Problem solving', modules: [
      ['dsa-recursion', 'Recursion, divide and conquer, and backtracking', 'Base cases; call stacks; recurrences; pruning', 'Generate subsets recursively and justify correctness with an invariant.'],
      ['dsa-trees-heaps', 'Trees, BSTs, heaps and tries', 'Traversals; BST invariants; priority queues; prefix lookup', 'Traverse a BST and use a heap to keep the k largest values.'],
      ['dsa-graphs', 'Graph modeling and traversal', 'Adjacency lists; BFS and DFS; components; topological sorting; union-find', 'Detect a cycle in a dependency graph and produce an order when possible.'],
      ['dsa-graph-paths', 'Shortest paths and spanning trees', 'BFS for unweighted paths; Dijkstra; Bellman–Ford; Kruskal and Prim', 'Choose a valid shortest-path algorithm for three different edge-weight assumptions.'],
      ['dsa-greedy-dp', 'Greedy algorithms and dynamic programming', 'Exchange arguments; state and transitions; memoization; tabulation; knapsack', 'Solve an interval scheduling problem and a knapsack problem and justify the differing strategies.'],
      'dsa-trees-lca-dp',
      ['dsa-cp-toolkit', 'Competitive programming toolkit', 'Bit operations; gcd and modular arithmetic; sieves; Fenwick trees and segment trees', 'Compare a Fenwick tree and a segment tree for range queries with updates.'],
      ['dsa-contest', 'Timed contests and upsolving', 'Problem selection; constraints; implementation checks; post-contest review', 'Take a timed practice set and solve one missed problem after writing its bottleneck.'],
    ] },
  ],
  gate_cse: [
    { title: 'Engineering Mathematics', modules: [
      ['gate27-discrete-logic', 'Logic, sets, relations and functions', 'Propositional and predicate logic; relations and functions; partial orders and lattices', 'Build truth tables and test whether a given relation is a partial order.'],
      ['gate27-discrete-counting', 'Algebraic structures, graphs and counting', 'Monoids and groups; connectivity, matching and coloring; enumeration, recurrences and generating functions', 'Count a restricted sequence using a recurrence and solve a small matching problem.'],
      ['gate27-linear', 'Linear algebra', 'Matrices and determinants; linear systems; eigenvalues and eigenvectors; LU factorization', 'Solve a small system by elimination and check it with an LU factorization.'],
      ['gate27-calculus', 'Calculus', 'Limits and continuity; derivatives; extrema; mean value theorem; integrals', 'Find extrema over a closed interval and verify the boundary cases.'],
      ['gate27-probability', 'Probability and statistics', 'Random variables; uniform, normal, exponential, Poisson and binomial models; summary statistics; conditional probability and Bayes', 'Identify the distribution in three word problems and solve one conditional probability problem.'],
    ] },
    { title: 'Digital Logic', modules: [
      ['gate27-logic-circuits', 'Digital logic and circuits', 'Boolean simplification, Karnaugh maps and tabulation; combinational and sequential circuits; fixed and floating-point arithmetic', 'Minimize a Boolean expression and trace a clocked circuit over four inputs.'],
    ] },
    { title: 'Computer Organization and Architecture', modules: [
      ['gate27-coa', 'Datapath, control, memory and I/O', 'Instructions and addressing; ALU; hardwired and microprogrammed control; memory hierarchy and cache mapping; interrupts and DMA; pipelines and hazards', 'Trace instruction stages, then compute cache hits for a short address sequence.'],
    ] },
    { title: 'Programming and Data Structures', modules: [
      ['gate27-c', 'C programming and recursion', 'Expressions; functions and pointers; arrays and memory; recursive traces', 'Trace C array and pointer examples, then implement and test a recursive function.'],
      ['gate27-structures', 'Linear and nonlinear structures', 'Arrays, stacks, queues and lists; trees, BSTs and binary heaps; graphs', 'Choose the right structure for six operations and trace a heap insertion.'],
    ] },
    { title: 'Algorithms', modules: [
      ['gate27-algorithms', 'Algorithm analysis and design', 'Worst-case time and space; search, sort and hashing; divide and conquer, greedy and dynamic programming', 'Write a recurrence for merge sort and compare greedy and DP examples.'],
      ['gate27-graph-algorithms', 'Graph algorithms', 'BFS and DFS; minimum spanning trees; shortest paths', 'Work a hand trace of BFS, a minimum spanning tree and a weighted shortest path.'],
    ] },
    { title: 'Theory of Computation', modules: [
      'gate-foundations-logic-dfa',
      ['gate27-languages', 'Regular expressions, context-free grammars and pushdown automata', 'Regular expressions and finite automata; grammar derivations; pushdown automata', 'Convert a small regular expression to an automaton and derive a string from a CFG.'],
      'gate-toc-pumping-lemma',
      ['gate27-computability', 'Turing machines and undecidability', 'Machine configurations; deciders and recognizers; reductions and undecidability', 'Trace a simple machine and outline a reduction argument.'],
    ] },
    { title: 'Compiler Design', modules: [
      ['gate27-compilers', 'Compilation and data-flow analysis', 'Lexing and parsing; syntax-directed translation; runtime environments; intermediate code; local optimization; constant propagation, liveness and common subexpressions', 'Tokenize an expression, create intermediate code and manually do one liveness pass.'],
    ] },
    { title: 'Operating Systems', modules: [
      ['gate27-os-processes', 'Processes, concurrency and scheduling', 'System calls; processes and threads; IPC; concurrency and synchronization; deadlock; CPU and I/O scheduling', 'Trace a CPU schedule and analyze a resource-allocation deadlock.'],
      ['gate27-os-memory', 'OS memory and file systems', 'Memory management; paging and virtual memory; file organization and allocation', 'Work a page-replacement trace and compare two file-allocation strategies.'],
    ] },
    { title: 'Databases', modules: [
      ['gate27-db-models', 'Data modeling and query languages', 'ER and relational models; relational algebra and tuple calculus; SQL; constraints; normal forms', 'Translate an ER model to relations and write the same query in SQL and relational algebra.'],
      ['gate27-db-storage', 'Database storage and transactions', 'File organization; B and B+ tree indexes; transactions and concurrency control', 'Trace index lookups and analyze whether a transaction schedule is conflict-serializable.'],
    ] },
    { title: 'Computer Networks', modules: [
      ['gate27-net-link-routing', 'Network layers, links and routing', 'Layering and switching; performance metrics; error detection, MAC and Ethernet; distance-vector and link-state routing', 'Compute transmission delay and trace a routing update.'],
      ['gate27-net-ip-tcp', 'IPv4, TCP and application protocols', 'Fragmentation, CIDR and NAT; TCP flow and congestion control; sockets; DNS and HTTP', 'Work a CIDR and fragmentation example and explain flow versus congestion control.'],
    ] },
    { title: 'General Aptitude', modules: [
      ['gate27-ga-verbal', 'Verbal aptitude', 'Grammar and vocabulary in context; reading comprehension; sequencing a narrative', 'Complete a passage and rearrange a set of sentences into a coherent paragraph.'],
      ['gate27-ga-quant', 'Quantitative aptitude', 'Tables and charts; ratios, percentages, exponents and logarithms; counting and series; geometry and measurement; basic probability and statistics', 'Solve a timed set using a table, a ratio, a geometry problem and a counting problem.'],
      ['gate27-ga-reasoning', 'Analytical and spatial aptitude', 'Deduction and induction; analogies and number relations; rotations, reflections, assembly and folding', 'Solve a mixed set and explain one logic answer and one shape transformation.'],
    ] },
    { title: 'Exam practice', modules: [
      ['gate27-mock', 'Previous papers and timed mock review', 'Topic-wise previous questions; full-paper pacing; accuracy and error analysis', 'Use a past paper from the organizer, record accuracy and turn missed questions into review tasks.'],
    ] },
  ],
  fullstack: [
    { title: 'Frontend foundations', modules: [
      'fs-web-html-css-js-scratch',
      ['fs-html-css', 'Semantic HTML, responsive CSS and accessibility', 'Forms; semantic landmarks; box model; Flexbox and Grid; responsive layouts; keyboard and labels', 'Build a keyboard-accessible form and check it on a narrow screen.'],
      ['fs-js-data', 'JavaScript fundamentals and data', 'Values and control flow; functions and scope; arrays and objects; modules; exceptions', 'Build reusable functions that filter a dataset and handle invalid input.'],
      ['fs-js-async', 'Browser JavaScript and asynchronous requests', 'DOM events; promises; async/await; fetch; loading and error states', 'Build a data view with loading, success, empty and failure states.'],
      ['fs-checkpoint-web', 'Independent frontend checkpoint', 'Semantic HTML, responsive CSS, keyboard access and JavaScript events', 'Build an accessible grocery-list page without copying a tutorial. Test add, remove, empty input and keyboard navigation.'],
      ['fs-git-testing', 'Git, tooling and testing', 'Version control and review; package scripts; debugging; unit and UI tests', 'Write tests for a form validator and review the change in a small branch.'],
      ['fs-react', 'TypeScript and React', 'Types; components; state; forms; routing; component tests', 'Build a typed form and a routed list and test its visible behavior.'],
    ] },
    { title: 'Server and deployment', modules: [
      ['fs-api', 'HTTP and backend APIs', 'Request lifecycle; REST; validation; errors; pagination; API tests', 'Build and test a CRUD endpoint with input validation and consistent errors.'],
      ['fs-db', 'SQL and persistence', 'Schema design; joins; constraints; transactions; migrations; queries', 'Persist records with constraints and test a migration and a rollback.'],
      ['fs-sql-practice', 'SQL joins and grouped queries', 'INNER JOIN, LEFT JOIN, GROUP BY and HAVING', 'Using students and enrollments tables, report each student and their enrollment count. Include students with zero enrollments.'],
      ['fs-auth-basics', 'Authentication and authorization foundations', 'Password handling concepts; cookies and sessions; roles; resource ownership', 'Write tests that an unauthenticated user and a different account cannot read private records.'],
      'fs-jwt-oauth-architecture',
      ['fs-production', 'Deployment and production operations', 'Environment configuration; CI/CD; logs; monitoring; rollback; performance', 'Deploy a small app with health checks and demonstrate a rollback.'],
      ['fs-capstone', 'Full-stack portfolio project', 'User flows; data and access model; automated tests; accessibility; documentation', 'Ship one end-to-end workflow and document its decisions, tests and deployment.'],
    ] },
  ],
  cybersecurity: [
    { title: 'Defensive foundations', modules: [
      ['cyber-fundamentals', 'Security principles and responsible practice', 'Confidentiality, integrity and availability; authorization; asset and risk inventories; ethical boundaries', 'Document scope and risks for an example college service.'],
      ['cyber-os-network', 'Operating systems and networking for defense', 'Linux permissions; processes and logs; TCP/IP, DNS, HTTP and TLS; segmentation', 'Explain a sample service inventory and choose which connections it needs.'],
      ['cyber-access-crypto', 'Identity and applied cryptography', 'Least privilege; MFA; authorization; hashing, encryption and signatures; key management', 'Create an access matrix and distinguish when hashing, encryption or signing applies.'],
      ['cyber-hardening', 'Hardening, patching and defensive assessment', 'Configuration baselines; dependency inventories; vulnerability triage; remediation validation', 'Prioritize patching from mock scan findings and add a verification checklist.'],
      'cyber-owasp-xss-csrf',
      ['cyber-monitoring', 'Logging, monitoring and incident response', 'Log sources; alerts; triage; containment; evidence handling; recovery', 'Build an incident timeline from sample logs and explain your escalation criteria.'],
      ['cyber-capstone', 'Defensive security portfolio case study', 'Threat modeling; safeguards; test evidence; reporting and recovery', 'Write a defensive review of a sample app with prioritized fixes and evidence of validation.'],
    ] },
  ],
  ai_ml: [
    { title: 'Programming, data and math', modules: [
      ['aiml-python', 'Python and reproducible notebooks', 'Types; loops; functions; collections; files; environments', 'Read a local CSV using a function and write tests for empty or invalid rows.'],
      ['aiml-data', 'Data cleaning and exploration', 'NumPy; pandas; missing values; charts; leakage risks', 'Clean a small dataset and explain which preprocessing should be fitted only on training data.'],
      ['aiml-math', 'Math for machine learning', 'Vectors and matrices; dot products; derivatives and gradients; probability and statistics', 'Compute a dot product, a simple derivative, and a conditional probability by hand.'],
    ] },
    { title: 'Modeling and applications', modules: [
      ['aiml-models', 'Regression, classification and evaluation', 'Baselines; regression and classification; train/validation/test splits; feature preprocessing; metrics', 'Fit a simple classifier and compare it with a baseline on held-out data.'],
      'aiml-gradient-descent-backprop',
      ['aiml-trees-unsupervised', 'Trees, ensembles and unsupervised learning', 'Decision trees; ensembles; clustering; PCA; validation and interpretability', 'Compare a tree model with a baseline and evaluate whether clustering output is meaningful.'],
      ['aiml-neural', 'Neural networks and deep learning', 'Layers and activations; backpropagation; optimization; CNNs and sequence basics', 'Train a small network and explain its loss curves and one failure case.'],
      ['aiml-genai', 'Generative AI and application evaluation', 'Tokens and embeddings; attention and transformers; retrieval; evaluation; privacy and reliability', 'Evaluate a retrieval-backed prototype against a small test set and record failures.'],
      ['aiml-deploy', 'ML portfolio project and monitoring', 'Reproducibility; data and model documentation; drift; service metrics', 'Package a model, publish an evaluation report and define one data-drift check.'],
    ] },
  ],
  japanese: [
    { title: 'Script and core language', modules: [
      'jp-hiragana-greetings-scratch',
      ['jp-kana', 'Complete hiragana and katakana', 'Kana charts; voiced sounds; small つ and contracted sounds; long vowels', 'Read and write a mixed list of kana words and check the audio.'],
      ['jp-vocab-kanji', 'Everyday vocabulary and kanji recognition', 'Numbers and time; people and places; common verbs and adjectives; kanji in context', 'Practice contextual vocabulary and recognize common kanji in signs and short phrases.'],
      ['jp-sentence-basics', 'Basic sentences and questions', 'Word order; です; yes/no questions; demonstratives; possession; existence', 'Write simple questions about objects, places and people and answer them aloud.'],
      'jp-n5-particles-verbs',
      ['jp-grammar', 'Adjectives, time and everyday expressions', 'Adjective forms; tense and negation; counters; requests; preferences; simple connectors', 'Put short sentences in order and complete a short dialogue with the correct forms.'],
    ] },
    { title: 'N5 test skills', modules: [
      ['jp-reading', 'N5 reading and information retrieval', 'Short texts; simple notices and schedules; main ideas; locating details', 'Read short notices and answer who, where, and when questions.'],
      ['jp-listening', 'N5 listening and quick response', 'Task comprehension; key points; situational expressions; short responses', 'Use the official samples and record which details you missed on the first listen.'],
      ['jp-mock', 'N5 mixed sample practice', 'Vocabulary and orthography; sentence and text grammar; reading; listening', 'Attempt official sample items, review each mistake and repeat the weakest skill.'],
    ] },
  ],
  english: [
    { title: 'Everyday communication', modules: [
      ['eng-basics', 'Personal introductions and simple questions', 'Basic sentence patterns; present and past; questions; common vocabulary', 'Record a one-minute introduction and answer three follow-up questions.'],
      ['eng-listening', 'Listening for meaning and detail', 'Gist; specific information; clarification; short summaries', 'Listen to a short explanation and summarize it with two supporting details.'],
      ['eng-pronunciation', 'Clear speech and conversation', 'Intelligibility; word stress and phrasing; turn-taking; clarification and repair', 'Record a short explanation, listen back, and improve pauses and word stress.'],
      ['eng-writing', 'Practical writing and professional messages', 'Paragraph structure; requests; concise emails; revision', 'Write and revise a short email requesting feedback on a project.'],
    ] },
    { title: 'Technical communication', modules: [
      ['eng-technical', 'Explain a process and support an opinion', 'Sequencing; definitions and examples; comparisons; evidence and trade-offs', 'Explain a project decision to a nontechnical listener using one concrete example.'],
      'eng-star-technical-articulation',
      ['eng-interview', 'Mock interview and discussion', 'Follow-up questions; paraphrasing; negotiation of meaning; reflection', 'Complete a mock interview and improve one answer using specific feedback.'],
    ] },
  ],
};

const references: Record<GoalId, [name: string, url: string, description: string]> = {
  placement: ['ACM/IEEE-CS/AAAI CS2023', 'https://csed.acm.org/knowledge-areas/', 'Curated placement preparation. CS topics reference CS2023 and interview tasks reflect your placement goal.'],
  dsa_cp: ['MIT OpenCourseWare 6.006', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/syllabus/', 'Java-first sequence from your first program through interview algorithms and contest practice.'],
  gate_cse: ['IIT Madras GATE 2027 CS syllabus', gateSource, 'Study sequence mapped to all ten CS syllabus sections and General Aptitude. The final module adds previous-paper and mock practice.'],
  fullstack: ['Mozilla MDN Curriculum', 'https://developer.mozilla.org/en-US/curriculum/', 'MDN-aligned frontend foundations with curated backend, deployment and portfolio modules.'],
  cybersecurity: ['NIST NICE Framework', 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/getting-started', 'Curated defensive cybersecurity path referencing NICE workforce skills.'],
  ai_ml: ['Google Machine Learning Crash Course', 'https://developers.google.com/machine-learning/crash-course/', 'Curated path from Python and math to applied ML, generative AI and evaluation.'],
  japanese: ['Official JLPT N5 test sections', 'https://www.jlpt.jp/e/guideline/testsections.html', 'Curated beginner Japanese sequence aligned to official N5 test skills. The topic sequence and study vocabulary are app choices.'],
  english: ['Council of Europe CEFR descriptors', 'https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors', 'Curated everyday English and technical interview path informed by CEFR communication skills.'],
};

export const CURRICULUM_REVISION = '2026-11-23';

export function applyAuditedCurriculum(roadmap: LearningRoadmap): LearningRoadmap {
  const [authoritySource, authorityUrl, description] = references[roadmap.goalId];
  const existing = new Map(roadmap.topics.map((topic) => [topic.id, topic]));
  const topics: RoadmapTopic[] = [];

  const stages = [{ title: zeroStage, modules: beginnerModules[roadmap.goalId] }, ...curriculum[roadmap.goalId]];
  for (const [index, stage] of stages.entries()) {
    for (const module of stage.modules) {
      const official = roadmap.goalId === 'gate_cse' && ![zeroStage, 'General Aptitude', 'Exam practice'].includes(stage.title);
      const sourceType = official ? 'OFFICIAL_SYLLABUS' : 'CURATED_ROADMAP';
      const placement = {
        stageId: `${roadmap.goalId}-stage-${index + 1}`,
        stageTitle: stage.title,
        prerequisites: topics.length ? [topics[topics.length - 1].id] : [],
        sourceType,
        isOfficialGateTopic: official,
      } as const;

      if (typeof module === 'string') {
        const original = existing.get(module);
        if (!original) throw new Error(`Missing curriculum module ${module}`);
        topics.push({ ...original, ...placement });
        continue;
      }

      const [id, title, coverage, practice] = module;
      const subtopics = coverage.split('; ');
      topics.push({
        ...placement,
        id,
        goalId: roadmap.goalId,
        title,
        subtopics,
        studyTask: practice,
        estimatedDurationMinutes: stage.title === zeroStage ? 15 : 30,
        objectives: subtopics,
        masteryCriteria: 'Complete the practice task and explain your reasoning.',
        lesson: {
          conceptIntroduction: title,
          simpleExplanation: coverage,
          realWorldAnalogy: '',
          workedExample: '',
          stepByStepDemonstration: [],
          guidedExercise: { question: practice, steps: [], expectedAnswer: '' },
          independentExercise: { prompt: practice, evaluationRubric: [] },
          quizQuestions: [],
          revisionRecommendation: 'Revisit any part of your practice that you could not explain independently.',
        },
      });
    }
  }

  const included = new Set(topics.map((topic) => topic.id));
  for (const topic of roadmap.topics) {
    if (!included.has(topic.id)) topics.push(topic);
  }

  return {
    ...roadmap,
    title: roadmap.goalId === 'gate_cse' ? 'GATE 2027 Computer Science Preparation' : roadmap.title,
    authoritySource,
    authorityUrl,
    description,
    sourceType: roadmap.goalId === 'gate_cse' ? 'OFFICIAL_SYLLABUS' : 'CURATED_ROADMAP',
    syllabusVersion: roadmap.goalId === 'gate_cse' ? 'GATE-CS-2027 with beginner foundations' : `Curriculum ${CURRICULUM_REVISION} with beginner foundations`,
    lastCheckedDate: CURRICULUM_REVISION,
    topics,
  };
}
