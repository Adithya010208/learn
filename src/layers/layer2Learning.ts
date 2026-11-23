import {
  GoalId,
  Layer1PublishedAvailability,
  LearningRoadmap,
  MasteryStatus,
  MissedSessionRecoveryDecision,
  RoadmapTopic,
  ScheduledLearningRecommendation,
  SkillGapRecommendationContract,
  SyllabusUpdateRecord,
  TopicMasteryRecord,
} from '../types/domain.ts';

/**
 * LAYER 2 — LEARNING INTELLIGENCE ENGINE
 *
 * Owns:
 * - Goal Roadmaps & Official vs Curated Syllabus Distinction
 * - One-Main-Skill-at-a-Time Rule Enforcement (Full-Stack -> Cybersecurity -> AI/ML)
 * - Prerequisite & Mastery-Aware Autonomous Topic Sequencing
 * - 10-Step Structured AI Tutor Lesson Content (Programming & Theoretical)
 * - Evidence-Based Mastery Engine & SM-2 Spaced Repetition
 * - Continuous Learning Unlocking (No Artificial Endpoint)
 * - Syllabus Source Registry & Versioned Update Approval Flow
 * - Intelligent Missed Session Recovery Planner
 */

export const INITIAL_ROADMAPS: LearningRoadmap[] = [
  {
    goalId: 'placement',
    title: 'Product-Based Software Placement (2029 Cohort)',
    shortTitle: 'Placement 2029',
    priorityTier: 'PRIMARY_CAREER',
    priorityRank: 1,
    isMainTechnicalTrack: false,
    isActiveMainSkill: true,
    sourceType: 'CURATED_ROADMAP',
    authoritySource: 'ACM/IEEE CS Curricula & Tier-1 Product Engineering Rubrics',
    authorityUrl: 'https://www.acm.org/education/curricula-recommendations',
    syllabusVersion: 'v2026.4',
    lastCheckedDate: '2026-11-15',
    description: 'Comprehensive placement readiness covering Core CS (DBMS, OS, CN, OOP), System Design fundamentals, Aptitude, and Technical Interviews.',
    continuousSpecializations: [
      'Distributed Systems & High-Throughput Caching',
      'Low-Level Design (LLD) & Concurrency Patterns',
      'Production Observability & Chaos Testing',
    ],
    topics: [
      {
        id: 'pl-cs-foundations-scratch',
        goalId: 'placement',
        stageId: 'stage-beginner-cs',
        stageTitle: 'Stage 1: Complete Beginner CS Foundations (From Scratch)',
        title: 'Core CS From Scratch: How Memory, Databases, Tables & SQL Queries Work',
        subtopics: ['What is RAM vs Disk Storage', 'Rows, Columns & Primary Keys', 'Writing Your First SELECT, INSERT & WHERE Query'],
        prerequisites: [],
        estimatedDurationMinutes: 45,
        objectives: [
          'Understand how programs store data in RAM vs persistent database tables on disk',
          'Design a simple relational table with a Primary Key from scratch',
          'Write and trace basic SQL SELECT, WHERE, and ORDER BY queries with zero prior knowledge',
        ],
        masteryCriteria: 'Score >= 80% on the beginner SQL & storage quiz and complete the first table query exercise.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction:
            'Welcome to Core Computer Science from absolute scratch! Every software application needs a way to store information permanently so it is not lost when the computer turns off. Relational databases organize data into structured tables made of rows and columns.',
          simpleExplanation:
            'Think of RAM (Random Access Memory) as your desk workspace—fast, but cleared when you leave. A Database on Disk is a permanent filing cabinet. Each Table is a spreadsheet (like `students`), each Row is one record (one student), and each Column is a property (`id`, `name`, `cgpa`).',
          realWorldAnalogy:
            'A school attendance register where every student has a unique Roll Number (Primary Key) so two students with the same name are never confused.',
          workedExample:
            'To find all students graduating in 2029 from a table named `students`, we write: `SELECT name, graduation_year FROM students WHERE graduation_year = 2029;`',
          stepByStepDemonstration: [
            '1. Create a table with column names and data types (`INT` for whole numbers, `TEXT` for words).',
            '2. Mark one unique column as `PRIMARY KEY` so every row can be uniquely identified.',
            '3. Use `INSERT INTO` to add a new row of data.',
            '4. Use `SELECT ... FROM ... WHERE ...` to filter and read back exact rows.',
          ],
          programmingDetails: {
            codeExample: `CREATE TABLE students (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  graduation_year INT
);

INSERT INTO students (id, name, graduation_year)
VALUES (1, 'ADHI', 2029);

SELECT name, graduation_year
FROM students
WHERE graduation_year = 2029;`,
            lineByLineExplanation: [
              'Line 1-5: Creates a new table called `students` with 3 columns (`id`, `name`, `graduation_year`).',
              'Line 2: `PRIMARY KEY` guarantees that no two rows can ever share the same `id`.',
              'Line 7-8: Inserts your first record `(1, \'ADHI\', 2029)` into the table.',
              'Line 10-12: Retrieves `name` and `graduation_year` only for rows where `graduation_year` equals `2029`.',
            ],
            dryRunTrace: 'Step 1: Table `students` is empty [] -> Step 2: Insert row #1 {id: 1, name: "ADHI", graduation_year: 2029} -> Step 3: SELECT checks row #1 (2029 == 2029 is TRUE) -> Output: ("ADHI", 2029).',
            testCases: [
              { input: 'WHERE graduation_year = 2029', expectedOutput: '1 row: ADHI (2029)', explanation: 'Matches the inserted student row.' },
              { input: 'INSERT duplicate id = 1', expectedOutput: 'Error: duplicate key value violates primary key constraint', explanation: 'Primary keys must be unique.' },
            ],
            debuggingExercise: {
              buggyCode: `SELECT name FROM students WHERE graduation_year == 2029;`,
              hint: 'In standard SQL, equality comparison inside a WHERE clause uses a single `=` sign, not `==`.',
              fixedCode: `SELECT name FROM students WHERE graduation_year = 2029;`,
            },
            codingChallenge: {
              prompt: 'Write a SQL query to select the `title` of all courses from a `courses` table where `stage` equals 1.',
              starterCode: `SELECT title FROM courses WHERE ____ = 1;`,
              solutionKey: 'stage',
              complexityAnalysis: 'Scanning N rows one by one takes O(N) time (Sequential Scan).',
            },
          },
          guidedExercise: {
            question: 'Why do we need a `PRIMARY KEY` column like `id` instead of using a person’s name as the unique identifier?',
            steps: [
              'Consider what happens if two students in the same college have the exact same name.',
              'A Primary Key must never be duplicated and never be empty (NOT NULL).',
            ],
            expectedAnswer: 'Multiple people can share the same name, whereas a numeric or UUID Primary Key is guaranteed to be unique for every row.',
          },
          independentExercise: {
            prompt: 'Write a `CREATE TABLE` statement for a `daily_tasks` table with `id` (INT PRIMARY KEY), `task_name` (TEXT), and `duration_minutes` (INT).',
            evaluationRubric: ['Defines all 3 columns with valid SQL types', 'Marks `id` as PRIMARY KEY'],
          },
          quizQuestions: [
            {
              id: 'q-pl-beg-1',
              question: 'What is the role of a PRIMARY KEY in a relational database table?',
              options: [
                'It uniquely identifies each row in the table and cannot be NULL or duplicated',
                'It encrypts the entire computer hard drive',
                'It deletes old rows automatically every night',
                'It only allows text values and blocks numbers',
              ],
              correctIndex: 0,
              explanation: 'A Primary Key enforces entity integrity: every row must have a unique, non-null identifier.',
              mistakeCategory: 'Relational Database Basics',
            },
            {
              id: 'q-pl-beg-2',
              question: 'Which SQL clause is used to filter rows so only records matching a condition are returned?',
              options: ['WHERE', 'ORDER BY', 'CREATE', 'INSERT'],
              correctIndex: 0,
              explanation: 'The WHERE clause filters rows before returning the result set.',
              mistakeCategory: 'SQL Query Fundamentals',
            },
          ],
          revisionRecommendation: 'Once you master basic tables and SQL queries, unlock Stage 2: DBMS B+ Tree Indexing & Transactions.',
        },
      },
      {
        id: 'pl-dbms-indexing',
        goalId: 'placement',
        stageId: 'stage-core-cs',
        stageTitle: 'Stage 2: Core CS Intermediate (DBMS Indexing & ACID)',
        title: 'DBMS B+ Tree Indexing & Transaction Isolation Levels',
        subtopics: ['Clustered vs Non-Clustered Indexes', 'B+ Tree Leaf Chaining', 'ACID & Read Committed vs Serializable', 'Phantom Reads'],
        prerequisites: ['pl-cs-foundations-scratch'],
        estimatedDurationMinutes: 45,
        objectives: [
          'Explain why relational databases use B+ Trees over binary search trees for disk-backed indexes',
          'Predict query execution plans for composite indexes using the leftmost prefix rule',
          'Distinguish Dirty Read, Non-Repeatable Read, and Phantom Read anomalies across isolation levels',
        ],
        masteryCriteria: 'Score >= 80% on SQL query plan & isolation assessment and complete the composite index tuning exercise.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction:
            'Database indexes are specialized lookup structures that minimize disk I/O blocks read during query execution, while transaction isolation defines how concurrent transactions observe each other’s writes.',
          simpleExplanation:
            'Without an index, PostgreSQL performs a Sequential Scan across every heap page. A B+ Tree stores sorted keys in internal routing nodes and chains all data pointers in leaf nodes, enabling O(log_B N) lookups and fast range scans.',
          realWorldAnalogy:
            'Think of a library catalog where multi-way signposts at the end of each aisle guide you directly to the exact shelf, and all books on that shelf are linked in alphabetical order so you can scan a range without walking back to the entrance.',
          workedExample:
            'Given `CREATE INDEX idx_user_date ON sessions (user_uid, date);`, a query with `WHERE user_uid = $1 AND date >= $2` uses an Index Range Scan in 3 page reads instead of scanning 50,000 rows.',
          stepByStepDemonstration: [
            '1. Inspect the query predicate columns (`WHERE`, `JOIN`, `ORDER BY`).',
            '2. Verify leftmost prefix alignment against the composite B+ Tree key order.',
            '3. Check whether all selected columns are covered (`Index Only Scan`) or require heap fetches.',
            '4. Select transaction isolation (`READ COMMITTED` vs `REPEATABLE READ`) based on concurrency anomaly tolerance.',
          ],
          programmingDetails: {
            codeExample: `EXPLAIN ANALYZE
SELECT session_code, date, quiz_score
FROM learning_sessions
WHERE user_uid = 'u_adhi' AND date >= '2026-11-01'
ORDER BY date DESC;`,
            lineByLineExplanation: [
              'Line 1: EXPLAIN ANALYZE executes the query and reports actual page reads and timing.',
              'Line 2-3: Selects target columns from the learning_sessions table.',
              'Line 4: Equality filter on user_uid followed by range filter on date matches composite index (user_uid, date).',
              'Line 5: Backward scan along doubly-linked B+ Tree leaf pages avoids an explicit sort pass.',
            ],
            dryRunTrace: 'Root Page [u_a..u_z] -> Internal Node [u_a..u_d] -> Leaf Page #42 (u_adhi, 2026-11-15) -> Leaf Page #41 (u_adhi, 2026-11-01). Total buffers hit: 3.',
            testCases: [
              {
                input: 'WHERE user_uid = "u1" AND date = "2026-11-15"',
                expectedOutput: 'Index Scan using idx_user_date',
                explanation: 'Uses both columns of the composite index.',
              },
              {
                input: 'WHERE date = "2026-11-15" (without user_uid)',
                expectedOutput: 'Seq Scan (or low-efficiency index scan)',
                explanation: 'Violates leftmost prefix rule because leading column user_uid is omitted.',
              },
            ],
            debuggingExercise: {
              buggyCode: `CREATE INDEX idx_wrong_order ON orders (created_at, customer_id);\n-- Query: SELECT * FROM orders WHERE customer_id = 42 AND created_at > '2026-01-01';`,
              hint: 'Place the equality column before the range column in the composite index definition.',
              fixedCode: `CREATE INDEX idx_customer_created ON orders (customer_id, created_at);`,
            },
            codingChallenge: {
              prompt: 'Write a SQL transaction at REPEATABLE READ isolation that safely transfers credit between two student milestones.',
              starterCode: `BEGIN TRANSACTION ISOLATION LEVEL ____;\nUPDATE milestones SET score = score + 10 WHERE id = 1;\nCOMMIT;`,
              solutionKey: 'REPEATABLE READ',
              complexityAnalysis: 'B+ Tree point lookup: O(log_B N) disk I/O; range scan of K rows: O(log_B N + K/B).',
            },
          },
          theoreticalDetails: {
            definitions: [
              { term: 'B+ Tree', definition: 'Balanced N-ary search tree where keys reside in internal nodes and all records/TIDs reside in linked leaf nodes.' },
              { term: 'Phantom Read', definition: 'When a transaction re-executes a range query and observes new rows inserted by another committed transaction.' },
            ],
            comparisons: [
              { aspect: 'Leaf Node Linkage', itemA: 'B-Tree: No leaf sibling pointers', itemB: 'B+ Tree: Doubly linked leaf pages for O(K) range scans' },
              { aspect: 'Fan-out Factor', itemA: 'B-Tree: Lower (data pointers in internal nodes)', itemB: 'B+ Tree: Higher (100-500 keys per 8KB page)' },
            ],
            diagramAscii: `          [ Internal Key: "u_k" | "u_t" ]\n           /             |              \\\n   [Leaf: u_a..u_j] <=> [Leaf: u_k..u_s] <=> [Leaf: u_t..u_z]`,
            applicationQuestions: [
              'Why does adding too many secondary indexes slow down INSERT and UPDATE heavy workloads?',
              'How does PostgreSQL MVCC prevent readers from blocking writers under READ COMMITTED?',
            ],
          },
          guidedExercise: {
            question: 'A table has composite index (department, salary). Which of these queries can use the index tree directly: (A) WHERE department = "CSE" AND salary > 80000, or (B) WHERE salary > 80000?',
            steps: [
              'Check the first column of the index: department.',
              'Query A provides an equality predicate on department and a range on salary.',
              'Query B skips department, so keys are not globally sorted by salary.',
            ],
            expectedAnswer: 'Query A uses the composite B+ Tree directly via the leftmost prefix rule.',
          },
          independentExercise: {
            prompt: 'Design a composite index for a session history table queried by (user_uid, status) and ordered by updated_at DESC.',
            evaluationRubric: [
              'Includes equality columns (user_uid, status) first',
              'Places sort/range column (updated_at DESC) last',
            ],
          },
          quizQuestions: [
            {
              id: 'q-dbms-1',
              question: 'Why are B+ Trees preferred over standard B-Trees for relational database storage engines?',
              options: [
                'Internal nodes omit data payloads, maximizing page fan-out and linking leaf pages for range scans',
                'B+ Trees use hash buckets for O(1) worst-case range queries',
                'B+ Trees never require page splits during insertions',
                'B+ Trees store all rows in CPU L1 cache only',
              ],
              correctIndex: 0,
              explanation: 'Omitting row payloads from internal nodes increases fan-out (reducing tree height), and linked leaf pages make range queries sequential.',
              mistakeCategory: 'Storage Engine Architecture',
            },
            {
              id: 'q-dbms-2',
              question: 'Given composite index (A, B, C), which query predicate CANNOT utilize the index via leftmost prefix?',
              options: [
                'WHERE A = 1 AND B = 2 AND C = 3',
                'WHERE A = 1 AND B > 10',
                'WHERE B = 2 AND C = 3',
                'WHERE A = 5',
              ],
              correctIndex: 2,
              explanation: 'Without leading column A, the B+ Tree order cannot narrow down starting pages for B and C.',
              mistakeCategory: 'Composite Index Prefix Rule',
            },
          ],
          revisionRecommendation: 'Review MVCC snapshot isolation and practice reading PostgreSQL EXPLAIN (ANALYZE, BUFFERS) output in 4 days.',
        },
      },
      {
        id: 'pl-os-virtual-memory',
        goalId: 'placement',
        stageId: 'stage-core-cs',
        stageTitle: 'Stage 1: Core CS Fundamentals (DBMS, OS, CN, OOP)',
        title: 'OS Virtual Memory, Page Tables & TLB Effective Access Time',
        subtopics: ['Multi-level Paging', 'Translation Lookaside Buffer (TLB)', 'Page Fault Handling', 'Belady Anomaly & LRU'],
        prerequisites: ['pl-dbms-indexing'],
        estimatedDurationMinutes: 45,
        objectives: [
          'Calculate Effective Memory Access Time (EMAT) given TLB hit ratio and page fault rate',
          'Explain why LRU page replacement is a stack algorithm immune to Belady’s Anomaly',
        ],
        masteryCriteria: 'Score >= 80% on EMAT numericals and complete the LRU page-frame trace.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction: 'Virtual memory decouples logical process address spaces from physical RAM frames using hardware page tables and a Translation Lookaside Buffer (TLB).',
          simpleExplanation: 'Every virtual address is split into a Virtual Page Number (VPN) and Page Offset. The CPU checks the fast associative TLB cache first; on a miss, it walks the page table in RAM.',
          realWorldAnalogy: 'A speed-dial list on your phone (TLB) vs looking up a contact in a multi-volume directory (Page Table) vs requesting directory assistance from archives (Page Fault to Disk).',
          workedExample: 'If TLB access = 2ns, RAM access = 100ns, and TLB hit ratio = 90%: EMAT = 0.90*(2 + 100) + 0.10*(2 + 100 + 100) = 91.8 + 20.2 = 112ns.',
          stepByStepDemonstration: [
            '1. Extract VPN and Offset bits from the virtual address.',
            '2. Compute TLB Hit path time = TLB_time + RAM_time.',
            '3. Compute TLB Miss path time = TLB_time + (Levels * RAM_time) + RAM_time.',
            '4. Weight by hit ratio alpha and (1 - alpha).',
          ],
          theoreticalDetails: {
            definitions: [
              { term: 'TLB (Translation Lookaside Buffer)', definition: 'Hardware associative cache storing recent Virtual-to-Physical Frame translations.' },
              { term: 'Thrashing', definition: 'State where a process spends more time paging frames between RAM and disk than executing CPU instructions.' },
            ],
            comparisons: [
              { aspect: 'Belady Anomaly', itemA: 'FIFO: Suffers from Belady Anomaly', itemB: 'LRU / Optimal: Immune (stack property)' },
            ],
            diagramAscii: `Virtual Address [ VPN | Offset ] --> TLB Hit? --Yes--> [ PFN | Offset ] --> Physical RAM\n                                      | No\n                                 Page Table Walk`,
            applicationQuestions: ['Why do modern 64-bit architectures use 4-level or 5-level hierarchical page tables instead of a single flat table?'],
          },
          guidedExercise: {
            question: 'Calculate EMAT when TLB takes 10ns, RAM takes 100ns, single-level page table, and TLB hit rate is 80%.',
            steps: ['Hit time = 10 + 100 = 110ns', 'Miss time = 10 + 100 + 100 = 210ns', 'EMAT = 0.8 * 110 + 0.2 * 210 = 88 + 42 = 130ns'],
            expectedAnswer: '130 ns',
          },
          independentExercise: {
            prompt: 'Trace reference string 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 across 3 frames using LRU and count page faults.',
            evaluationRubric: ['Maintains recency order accurately', 'Identifies exact page hits vs faults'],
          },
          quizQuestions: [
            {
              id: 'q-os-1',
              question: 'With TLB lookup = 10ns, memory access = 100ns, single-level paging, and 80% TLB hit ratio, what is the Effective Memory Access Time?',
              options: ['130 ns', '110 ns', '150 ns', '210 ns'],
              correctIndex: 0,
              explanation: '0.8 * (10 + 100) + 0.2 * (10 + 100 + 100) = 88 + 42 = 130 ns.',
              mistakeCategory: 'EMAT Formula Calculation',
            },
            {
              id: 'q-os-2',
              question: 'Which page replacement policy is guaranteed never to suffer from Belady’s Anomaly?',
              options: ['LRU (Least Recently Used)', 'FIFO', 'Random Replacement', 'Second-Chance FIFO'],
              correctIndex: 0,
              explanation: 'LRU satisfies the inclusion/stack property, so pages in K frames are always a subset of pages in K+1 frames.',
              mistakeCategory: 'Page Replacement Policies',
            },
          ],
          revisionRecommendation: 'Practice 2-level page table + page-fault service time numericals for both Placement and GATE CSE.',
        },
      },
    ],
  },
  {
    goalId: 'dsa_cp',
    title: 'DSA & Competitive Programming',
    shortTitle: 'DSA & CP',
    priorityTier: 'CORE_SUPPORT',
    priorityRank: 2,
    isMainTechnicalTrack: false,
    isActiveMainSkill: true,
    sourceType: 'CURATED_ROADMAP',
    authoritySource: 'NeetCode 150 / Codeforces Div.2 & ICPC Pattern Taxonomy',
    authorityUrl: 'https://cp-algorithms.com',
    syllabusVersion: 'v2026.9',
    lastCheckedDate: '2026-11-15',
    description: 'Algorithmic problem-solving patterns, time/space complexity mastery, contest readiness, and mistake categorization.',
    continuousSpecializations: [
      'Segment Trees with Lazy Propagation',
      'Digit DP & Bitmask Dynamic Programming',
      'Max-Flow Min-Cut & Bipartite Matching',
    ],
    topics: [
      {
        id: 'dsa-basics-arrays-complexity',
        goalId: 'dsa_cp',
        stageId: 'stage-dsa-scratch',
        stageTitle: 'Stage 1: Complete Beginner Coding & DSA Foundations (From Scratch)',
        title: 'Programming Logic, Arrays, Loops & Big-O Time Complexity from Zero',
        subtopics: ['0-Indexed Arrays in Memory', 'For/While Loop Tracing', 'Counting Operations & Big-O Notation (O(1), O(N), O(N^2))'],
        prerequisites: [],
        estimatedDurationMinutes: 45,
        objectives: [
          'Understand how arrays store elements in contiguous memory cells starting at index 0',
          'Trace a `for` loop step-by-step to compute the sum and maximum of an array from scratch',
          'Distinguish O(1) constant time, O(N) single-loop linear time, and O(N^2) nested-loop time',
        ],
        masteryCriteria: 'Score >= 80% on the beginner arrays & Big-O quiz and complete the array maximum dry-run exercise.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction:
            'Data Structures and Algorithms (DSA) starts with two simple building blocks: storing a list of items in an Array, and processing them step-by-step using a Loop. Big-O notation is simply a way to measure how the number of steps grows as the array gets larger.',
          simpleExplanation:
            'An array `nums = [10, 25, 7, 40]` stores 4 numbers side-by-side. The first element is at index `0` (`nums[0] = 10`). Looking up `nums[2]` takes 1 instant step (`O(1)`). Visiting every element once with a single loop takes `N` steps (`O(N)`).',
          realWorldAnalogy:
            'Reading house #5 on a numbered street takes 1 step (`O(1)`). Knocking on every door along a street of N houses takes N steps (`O(N)`). Every house visiting every other house takes N * N steps (`O(N^2)`).',
          workedExample:
            'To find the largest number in `[10, 25, 7, 40]`: start with `maxVal = 10`. Compare with `25` (`maxVal` becomes `25`), compare with `7` (keep `25`), compare with `40` (`maxVal` becomes `40`). Total comparisons: 3 (which is N - 1, or O(N)).',
          stepByStepDemonstration: [
            '1. Set `maxVal = nums[0]` (assume the first element is the largest so far).',
            '2. Loop index `i` from `1` up to `nums.length - 1`.',
            '3. At each step, if `nums[i] > maxVal`, update `maxVal = nums[i]`.',
            '4. After the loop finishes, return `maxVal`.',
          ],
          programmingDetails: {
            codeExample: `export function findMaxElement(nums: number[]): number {
  let maxVal = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > maxVal) {
      maxVal = nums[i];
    }
  }
  return maxVal;
}`,
            lineByLineExplanation: [
              'Line 2: Initializes `maxVal` with the very first element at index 0.',
              'Line 3: Loops `i` through the remaining indices `1, 2, ..., nums.length - 1`.',
              'Line 4-6: Updates `maxVal` whenever we see a larger number at `nums[i]`.',
              'Line 8: Returns the largest number found after checking every element once.',
            ],
            dryRunTrace: 'nums = [12, 45, 8, 90]:\ninit: maxVal = 12\ni=1 (nums[1]=45): 45 > 12 -> maxVal = 45\ni=2 (nums[2]=8): 8 > 45 is false -> maxVal = 45\ni=3 (nums[3]=90): 90 > 45 -> maxVal = 90\nReturn 90.',
            testCases: [
              { input: 'nums = [12, 45, 8, 90]', expectedOutput: '90', explanation: 'Finds maximum in 1 pass.' },
              { input: 'nums = [-5, -2, -10]', expectedOutput: '-2', explanation: 'Works accurately on negative numbers because maxVal starts at nums[0], not 0.' },
            ],
            debuggingExercise: {
              buggyCode: `let maxVal = 0; // Bug when all numbers in nums are negative like [-10, -5, -20]`,
              hint: 'Initialize `maxVal` to `nums[0]` instead of `0` so arrays of negative numbers return the true maximum (`-5` instead of `0`).',
              fixedCode: `let maxVal = nums[0];`,
            },
            codingChallenge: {
              prompt: 'What is the Big-O time complexity of a single loop that runs from `i = 0` to `n - 1` doing O(1) work per step?',
              starterCode: `const timeComplexity = "____";`,
              solutionKey: 'O(N)',
              complexityAnalysis: 'Time Complexity: O(N) because we visit each of the N elements once. Space Complexity: O(1) extra memory.',
            },
          },
          guidedExercise: {
            question: 'Why does initializing `let maxVal = 0` fail on the array `[-8, -3, -15]`?',
            steps: [
              'Every element in `[-8, -3, -15]` is less than `0`.',
              'So `nums[i] > maxVal` is never true, and the function wrongly returns `0` (which is not even in the array!).',
            ],
            expectedAnswer: 'Because 0 is larger than all negative numbers in the array; initializing `maxVal = nums[0]` fixes this.',
          },
          independentExercise: {
            prompt: 'Write a short loop to calculate the sum of all numbers in an array `nums = [5, 10, 15, 20]` and state its Big-O time and space complexity.',
            evaluationRubric: ['Accumulates `sum += nums[i]` accurately', 'Identifies O(N) time and O(1) space'],
          },
          quizQuestions: [
            {
              id: 'q-dsa-beg-1',
              question: 'In a 0-indexed array `arr = [10, 20, 30, 40]`, what is the value of `arr[2]` and how fast is accessing it by index?',
              options: [
                '30, accessed in O(1) constant time',
                '20, accessed in O(N) linear time',
                '30, accessed in O(N^2) time',
                '40, accessed in O(log N) time',
              ],
              correctIndex: 0,
              explanation: 'Index 0 is 10, index 1 is 20, and index 2 is 30. Array index lookup uses direct memory address calculation `base + i * size` in O(1) time.',
              mistakeCategory: 'Array Indexing & O(1) Lookup',
            },
            {
              id: 'q-dsa-beg-2',
              question: 'If an algorithm has one outer loop running N times and an inner loop also running N times for each outer step, what is the total time complexity?',
              options: ['O(N^2)', 'O(N)', 'O(1)', 'O(log N)'],
              correctIndex: 0,
              explanation: 'N outer iterations multiplied by N inner iterations equals N * N = O(N^2) operations.',
              mistakeCategory: 'Nested Loop Big-O Analysis',
            },
          ],
          revisionRecommendation: 'Master arrays, loops, and O(N) complexity first to unlock Stage 2: Sliding Window & Two-Pointer Patterns.',
        },
      },
      {
        id: 'dsa-sliding-window-monotonic',
        goalId: 'dsa_cp',
        stageId: 'stage-patterns-1',
        stageTitle: 'Stage 2: Linear & Subarray Problem-Solving Patterns',
        title: 'Variable-Size Sliding Window & Monotonic Deque Optimization',
        subtopics: ['Two-Pointer Invariant', 'Frequency Map Window Contraction', 'Monotonic Decreasing Deque for Window Maximum'],
        prerequisites: ['dsa-basics-arrays-complexity'],
        estimatedDurationMinutes: 45,
        objectives: [
          'Maintain a valid subarray window in O(N) amortized time without nested O(N^2) re-scanning',
          'Use a monotonic deque to query sliding window extrema in O(1) per step',
        ],
        masteryCriteria: 'Score >= 80% on complexity & invariant quiz and pass the Sliding Window Maximum dry-run exercise.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction:
            'The Sliding Window pattern converts O(N*K) or O(N^2) contiguous subarray problems into O(N) linear passes by maintaining a monotonic window invariant as the right pointer expands and the left pointer contracts.',
          simpleExplanation:
            'Each element enters the window once when `right` advances and leaves at most once when `left` advances. Therefore, the inner `while` loop executes at most N times across the entire array.',
          realWorldAnalogy:
            'Like a caterpillar moving across a branch: the front extends forward to taste new leaves while the tail pulls up whenever the body stretches beyond its allowed length.',
          workedExample:
            'Longest Substring Without Repeating Characters on `"abcabcbb"`: window expands to `"abc"` (len 3), sees second `"a"`, advances `left` past first `"a"`, maintaining max length = 3 in 8 steps.',
          stepByStepDemonstration: [
            '1. Initialize `left = 0`, state accumulator (hash map / sum / deque), and `best = 0`.',
            '2. Expand `right` from `0` to `n - 1` and incorporate `nums[right]` into window state.',
            '3. While window invariant is violated, remove `nums[left]` and increment `left++`.',
            '4. Update `best = Math.max(best, right - left + 1)` when the invariant holds.',
          ],
          programmingDetails: {
            codeExample: `export function maxSlidingWindow(nums: number[], k: number): number[] {
  const deque: number[] = []; // stores indices in decreasing order of values
  const result: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    if (deque.length > 0 && deque[0] <= i - k) {
      deque.shift();
    }
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop();
    }
    deque.push(i);
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }
  return result;
}`,
            lineByLineExplanation: [
              'Line 2: `deque` stores array indices whose values are strictly decreasing from front to back.',
              'Line 6-8: Evicts the front index if it has fallen outside the current window `[i - k + 1, i]`.',
              'Line 9-11: Pops smaller or equal elements from the back because they can never be the maximum now that `nums[i]` is newer and larger.',
              'Line 13-15: Once the first window of size `k` is formed, `nums[deque[0]]` is guaranteed to be the window maximum.',
            ],
            dryRunTrace: 'nums = [1, 3, -1, -3, 5], k = 3:\ni=0 (1): deque=[0]\ni=1 (3): pop 0, deque=[1]\ni=2 (-1): deque=[1,2] -> output nums[1]=3\ni=3 (-3): deque=[1,2,3] -> output nums[1]=3\ni=4 (5): evict 1, pop 3, pop 2, deque=[4] -> output nums[4]=5.',
            testCases: [
              { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', expectedOutput: '[3,3,5,5,6,7]', explanation: 'Monotonic deque yields max for each of the 6 windows in O(N).' },
              { input: 'nums = [4,2], k = 2', expectedOutput: '[4]', explanation: 'Single window of size 2.' },
            ],
            debuggingExercise: {
              buggyCode: `while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {\n  deque.pop();\n}\n// Bug: stores values instead of indices in deque.push(nums[i])`,
              hint: 'Store indices `i` in the deque so you can accurately check `deque[0] <= i - k` for window expiration.',
              fixedCode: `deque.push(i);`,
            },
            codingChallenge: {
              prompt: 'Complete the condition to shrink a variable sliding window when `windowSum > target`.',
              starterCode: `while (windowSum > target && left <= right) {\n  windowSum -= nums[left];\n  left++;\n}`,
              solutionKey: 'windowSum -= nums[left]',
              complexityAnalysis: 'Time Complexity: O(N) amortized (each index pushed and popped at most once). Auxiliary Space: O(K).',
            },
          },
          guidedExercise: {
            question: 'Why is the time complexity of `maxSlidingWindow` O(N) despite having a `while` loop inside a `for` loop?',
            steps: [
              'Count how many times each index `i` can be pushed onto `deque` (exactly once).',
              'Count how many times each index `i` can be popped or shifted from `deque` (at most once).',
              'Total deque operations across all N iterations <= 2N.',
            ],
            expectedAnswer: 'Amortized O(1) per element because each index is pushed once and popped at most once (<= 2N total operations).',
          },
          independentExercise: {
            prompt: 'Write the state invariant for finding the Minimum Window Substring containing all characters of string `t` in string `s`.',
            evaluationRubric: ['Tracks `have` vs `need` distinct character counts', 'Contracts `left` while `have === need` to minimize length'],
          },
          quizQuestions: [
            {
              id: 'q-dsa-1',
              question: 'What is the worst-case time complexity of the Monotonic Deque Sliding Window Maximum algorithm for an array of size N and window K?',
              options: ['O(N)', 'O(N log K)', 'O(N * K)', 'O(N^2)'],
              correctIndex: 0,
              explanation: 'Every element index is pushed onto the deque once and popped at most once, yielding at most 2N operations.',
              mistakeCategory: 'Amortized Complexity Analysis',
            },
            {
              id: 'q-dsa-2',
              question: 'Why cannot standard Two-Pointer / Sliding Window be directly applied to "Shortest Subarray with Sum at Least K" when the array contains negative numbers?',
              options: [
                'Adding elements can decrease the sum and removing elements can increase the sum, breaking monotonicity',
                'Negative numbers cannot be stored in hash maps',
                'JavaScript arrays do not support negative integers',
                'Window size K must always be prime',
              ],
              correctIndex: 0,
              explanation: 'Standard sliding window relies on monotonic growth when expanding right and monotonic shrinkage when contracting left; negative numbers require a prefix-sum monotonic deque.',
              mistakeCategory: 'Window Monotonicity Preconditions',
            },
          ],
          revisionRecommendation: 'Solve LeetCode 239 (Sliding Window Maximum) and 862 (Shortest Subarray with Sum at Least K) in 3 days.',
        },
      },
      {
        id: 'dsa-trees-lca-dp',
        goalId: 'dsa_cp',
        stageId: 'stage-patterns-2',
        stageTitle: 'Stage 2: Trees, Graphs & Dynamic Programming',
        title: 'Binary Lifting for Lowest Common Ancestor (LCA) & Tree DP',
        subtopics: ['Euler Tour & Depth Array', '2^j Ancestor Table `up[u][j]`', 'Tree Diameter via Post-Order DP'],
        prerequisites: ['dsa-sliding-window-monotonic'],
        estimatedDurationMinutes: 45,
        objectives: [
          'Precompute binary lifting table in O(N log N) and answer LCA queries in O(log N)',
          'Formulate post-order Tree DP state transitions',
        ],
        masteryCriteria: 'Score >= 80% on Binary Lifting transitions and complete the LCA jump trace.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction: 'Binary Lifting precomputes the 2^j-th ancestor of every node in a tree so any k-th ancestor or Lowest Common Ancestor (LCA) query can be resolved in O(log N) binary jumps.',
          simpleExplanation: 'Since any jump distance can be written in binary, knowing the 1st, 2nd, 4th, 8th... ancestors lets us jump halfway twice: `up[u][j] = up[ up[u][j-1] ][j-1]`.',
          realWorldAnalogy: 'Express train lines that stop at every 1st, 2nd, 4th, and 8th station allow you to reach any station in at most log2(N) transfers.',
          workedExample: 'To find the 13th ancestor of node u (13 = 8 + 4 + 1 = 1101_2), jump `u = up[u][3]`, then `u = up[u][2]`, then `u = up[u][0]`.',
          stepByStepDemonstration: [
            '1. Run DFS from root to record `depth[u]` and base case `up[u][0] = parent`.',
            '2. Fill `up[u][j] = up[up[u][j-1]][j-1]` for `j = 1..LOG-1`.',
            '3. Equalize depths of `u` and `v` by lifting the deeper node by `depth[u] - depth[v]`.',
            '4. Lift both `u` and `v` from `j = LOG-1` down to `0` whenever `up[u][j] !== up[v][j]`, then return `up[u][0]`.',
          ],
          guidedExercise: {
            question: 'Write the recurrence relation for `up[u][j]`, the 2^j-th ancestor of node `u`.',
            steps: ['2^j = 2^(j-1) + 2^(j-1)', 'First jump 2^(j-1) steps from u to mid = up[u][j-1]', 'Then jump 2^(j-1) steps from mid'],
            expectedAnswer: 'up[u][j] = up[up[u][j - 1]][j - 1]',
          },
          independentExercise: {
            prompt: 'Compute distance between nodes u and v in an unweighted tree using depth[] and LCA(u, v).',
            evaluationRubric: ['Uses formula dist(u, v) = depth[u] + depth[v] - 2 * depth[LCA(u, v)]'],
          },
          quizQuestions: [
            {
              id: 'q-lca-1',
              question: 'What is the recurrence for computing the 2^j-th ancestor `up[u][j]` in Binary Lifting?',
              options: [
                'up[u][j] = up[up[u][j - 1]][j - 1]',
                'up[u][j] = up[u][j - 1] + up[u][j - 2]',
                'up[u][j] = up[u][j / 2] * 2',
                'up[u][j] = depth[u] - (1 << j)',
              ],
              correctIndex: 0,
              explanation: 'Jumping 2^j steps upward is equivalent to jumping 2^(j-1) steps twice.',
              mistakeCategory: 'Binary Lifting Recurrence',
            },
          ],
          revisionRecommendation: 'Practice CSES Company Queries I & II to solidify Binary Lifting.',
        },
      },
    ],
  },
  {
    goalId: 'gate_cse',
    title: 'GATE CSE Official Syllabus & PYQ Mastery',
    shortTitle: 'GATE CSE',
    priorityTier: 'BACKUP_CAREER',
    priorityRank: 3,
    isMainTechnicalTrack: false,
    isActiveMainSkill: true,
    sourceType: 'OFFICIAL_SYLLABUS',
    authoritySource: 'Official GATE 2026/2027 CS & IT Syllabus (IIT Roorkee / IIT Guwahati)',
    authorityUrl: 'https://gate2026.iitr.ac.in',
    syllabusVersion: 'GATE-CS-2026.1',
    lastCheckedDate: '2026-11-15',
    description: 'Authoritative GATE CSE syllabus tracking across TOC, Compiler Design, COA, Discrete Math, OS, DBMS, CN, and Algorithms with PYQ accuracy.',
    continuousSpecializations: [
      'Full-Length 65-Question Timed GATE Mock Series',
      'High-Weightage Numerical Answer Type (NAT) Precision Drills',
    ],
    topics: [
      {
        id: 'gate-foundations-logic-dfa',
        goalId: 'gate_cse',
        stageId: 'stage-gate-scratch',
        stageTitle: 'Stage 1: GATE CSE Beginner Foundations (From Scratch)',
        title: 'GATE CSE From Scratch: Propositional Logic, Sets & Introduction to Finite Automata (DFA)',
        subtopics: ['Truth Tables & Logical Implication (P -> Q)', 'Alphabets, Strings & Languages (Σ*)', 'Designing Your First DFA State Diagram'],
        prerequisites: [],
        estimatedDurationMinutes: 45,
        objectives: [
          'Evaluate logical implication `P -> Q` and contrapositive `~Q -> ~P` from scratch',
          'Understand alphabets (Σ), strings, and formal languages as sets of strings',
          'Construct a simple 2-state Deterministic Finite Automaton (DFA) from zero prior knowledge',
        ],
        masteryCriteria: 'Score >= 80% on the beginner Discrete Logic & DFA quiz and complete the even-zeros DFA trace.',
        sourceType: 'OFFICIAL_SYLLABUS',
        isOfficialGateTopic: true,
        lesson: {
          conceptIntroduction:
            'GATE CSE starts with two core pillars: Discrete Mathematics (how we reason with logic and sets) and Theory of Computation (how simple abstract machines recognize patterns in strings).',
          simpleExplanation:
            'An Alphabet `Σ = {0, 1}` is just a set of allowed symbols. A String is a sequence like `"010"`. A Language is a set of strings following a rule (for example, all strings ending with `1`). A DFA is a simple state machine with a Start State, arrows for each input symbol, and Final Accepting States.',
          realWorldAnalogy:
            'A simple light switch has 2 states: OFF and ON. Pressing the button once moves from OFF to ON; pressing it again moves from ON back to OFF. After an even number of presses, the light is back in the OFF state!',
          workedExample:
            'To accept binary strings with an EVEN number of `1`s: Start in state `q_even` (Accepting). On seeing `0`, stay in the current state. On seeing `1`, toggle between `q_even` and `q_odd`.',
          stepByStepDemonstration: [
            '1. Identify the minimum memory needed (for "even vs odd count of 1s", only 2 states are needed: `q_even` and `q_odd`).',
            '2. Mark `q_even` as the Start State (0 ones seen so far, which is even).',
            '3. Draw transitions for both `0` and `1` from every state.',
            '4. Trace input `"101"`: `q_even` --(1)--> `q_odd` --(0)--> `q_odd` --(1)--> `q_even` (Accepted!).',
          ],
          theoreticalDetails: {
            definitions: [
              { term: 'Implication (P -> Q)', definition: 'False ONLY when P is True and Q is False; True in all other 3 cases.' },
              { term: 'DFA (5-Tuple)', definition: 'M = (Q, Σ, δ, q0, F) where δ: Q × Σ -> Q gives exactly one next state for every (state, symbol) pair.' },
            ],
            comparisons: [
              { aspect: 'Implication Equivalence', itemA: 'P -> Q is logically equivalent to ~P ∨ Q', itemB: 'Contrapositive ~Q -> ~P is also equivalent to P -> Q' },
            ],
            diagramAscii: `   --(0)-->               --(0)-->\n  |        |             |        |\n->(( q_even )) <--(1)--> (  q_odd  )`,
            applicationQuestions: ['How many states are required in a minimal DFA to check whether a binary number is divisible by 3?'],
          },
          guidedExercise: {
            question: 'When is the logical implication `P -> Q` ("If it rains, I carry an umbrella") FALSE?',
            steps: ['Check the 4 truth table rows for (P, Q).', 'The promise is broken only when P happens (True) and Q does not happen (False).'],
            expectedAnswer: 'Only when P is True and Q is False.',
          },
          independentExercise: {
            prompt: 'Trace the state sequence of the Even-Ones DFA on the input string `"1101"` and state whether it is Accepted or Rejected.',
            evaluationRubric: ['Traces q_even -> q_odd -> q_even -> q_even -> q_odd', 'Concludes Rejected (3 ones is odd)'],
          },
          quizQuestions: [
            {
              id: 'q-gate-beg-1',
              question: 'Which expression is logically equivalent to the implication `P -> Q`?',
              options: ['~P ∨ Q (NOT P or Q)', 'P ∧ ~Q', 'Q -> P', '~P ∧ ~Q'],
              correctIndex: 0,
              explanation: 'Since P -> Q is false only when P is True and Q is False, its negation is (P ∧ ~Q), so P -> Q ≡ ~P ∨ Q.',
              mistakeCategory: 'Propositional Logic Equivalences',
            },
            {
              id: 'q-gate-beg-2',
              question: 'What is the minimum number of states in a DFA over Σ = {a, b} that accepts all strings of length at least 2?',
              options: ['3 states', '1 state', '2 states', '4 states'],
              correctIndex: 0,
              explanation: 'We need state q0 (length 0), state q1 (length 1), and accepting state q2 (length >= 2, which loops to itself). Total = 3 states.',
              mistakeCategory: 'Minimal DFA Construction',
            },
          ],
          revisionRecommendation: 'Master basic logic and DFA construction to unlock Section 6: Closure Properties & Pumping Lemma.',
        },
      },
      {
        id: 'gate-toc-pumping-lemma',
        goalId: 'gate_cse',
        stageId: 'stage-gate-toc',
        stageTitle: 'Stage 2: Theory of Computation (Official GATE Syllabus)',
        title: 'Regular & Context-Free Languages: Closure Properties & Pumping Lemma',
        subtopics: ['DFA/NFA Equivalence', 'Closure under Intersection & Complement', 'Pumping Lemma for Regular vs CFL', 'Decidability Table'],
        prerequisites: ['gate-foundations-logic-dfa'],
        estimatedDurationMinutes: 45,
        objectives: [
          'Classify formal languages into Regular, DCFL, CFL, CSL, and Recursive using closure properties',
          'Solve GATE PYQ multiple-select questions on closure operations of DCFL vs CFL',
        ],
        masteryCriteria: 'Score >= 80% on GATE TOC PYQ assessment and complete the Chomsky hierarchy classification table.',
        sourceType: 'OFFICIAL_SYLLABUS',
        isOfficialGateTopic: true,
        lesson: {
          conceptIntroduction:
            'In GATE CSE Theory of Computation, identifying whether a language is Regular, Deterministic Context-Free (DCFL), or Context-Free (CFL) relies on closure properties and resource bounds (finite state vs single stack).',
          simpleExplanation:
            'Regular languages are closed under Union, Intersection, Complement, Kleene Star, and Homomorphism. CFLs are closed under Union, Concatenation, Kleene Star, and Intersection with a Regular Language—but NOT closed under general Intersection or Complement.',
          realWorldAnalogy:
            'A turnstile counter with fixed gears (DFA) cannot remember an arbitrary count of people entering to match with people exiting; a spring-loaded tray stack (PDA) can match one comparison (a^n b^n), but cannot match two independent dependent counts (a^n b^n c^n).',
          workedExample:
            'GATE PYQ: Is L = { a^n b^n c^m | n, m >= 1 } Context-Free? Yes! Push `a`s onto stack, pop against `b`s, and ignore `c`s in a final loop. However, L1 ∩ L2 where L1 = {a^n b^n c^m} and L2 = {a^m b^n c^n} yields {a^n b^n c^n}, which is NOT Context-Free.',
          stepByStepDemonstration: [
            '1. Count the number of independent unbounded comparisons required.',
            '2. Zero unbounded comparisons -> Regular (DFA).',
            '3. One LIFO comparison without backtracking -> DCFL; with nondeterminism (e.g. even-length palindromes ww^R) -> CFL.',
            '4. Two or more chained comparisons (a^n b^n c^n) -> Context-Sensitive (LBA), not CFL.',
          ],
          theoreticalDetails: {
            definitions: [
              { term: 'DCFL Closure', definition: 'Closed under Complement and Intersection with Regular language; NOT closed under Union or Intersection.' },
              { term: 'CFL Closure', definition: 'Closed under Union, Concatenation, Kleene Star; NOT closed under Intersection or Complement.' },
            ],
            comparisons: [
              { aspect: 'Complement Closure', itemA: 'DCFL: Closed under complement', itemB: 'CFL: NOT closed under complement' },
              { aspect: 'Emptiness Problem', itemA: 'CFL: Decidable in polynomial time', itemB: 'Turing Machine (RE): Undecidable (Rice Theorem)' },
            ],
            diagramAscii: `Regular (DFA)  ⊂  DCFL (DPDA)  ⊂  CFL (NPDA)  ⊂  CSL (LBA)  ⊂  Recursive  ⊂  RE`,
            applicationQuestions: [
              'Why does closure under Union + Closure under Complement imply Closure under Intersection via De Morgan’s Law?',
            ],
          },
          guidedExercise: {
            question: 'If L1 is a Context-Free Language and R is a Regular Language, what is the class of L1 ∩ R?',
            steps: [
              'Recall product construction between an NPDA for L1 and a DFA for R.',
              'The combined machine simulates the NPDA stack and tracks DFA state pairs in its finite control.',
              'Therefore, only one stack is needed.',
            ],
            expectedAnswer: 'Context-Free Language (CFL) — CFLs are closed under intersection with Regular languages.',
          },
          independentExercise: {
            prompt: 'Determine whether L = { w in {0,1}* | number of 0s equals number of 1s } is Regular, DCFL, or non-CFL.',
            evaluationRubric: ['Identifies single unbounded counter using stack with bottom marker -> DCFL'],
          },
          quizQuestions: [
            {
              id: 'q-gate-toc-1',
              question: '[Official GATE CS PYQ] Let L1 be a Context-Free Language and L2 be a Regular Language. Which of the following is ALWAYS true?',
              options: [
                'L1 ∩ L2 is always Context-Free',
                'L1 ∩ L2 is always Regular',
                'Complement of L1 is always Context-Free',
                'L1 - L2 is always Regular',
              ],
              correctIndex: 0,
              explanation: 'CFLs are closed under intersection with Regular languages via PDA-DFA cross-product state construction.',
              mistakeCategory: 'Formal Language Closure Properties',
            },
            {
              id: 'q-gate-toc-2',
              question: 'Which operation is Deterministic Context-Free Languages (DCFL) closed under, whereas general CFLs are NOT?',
              options: ['Complement', 'Union', 'Concatenation', 'Kleene Star'],
              correctIndex: 0,
              explanation: 'DCFLs are closed under complement (by swapping accepting/non-accepting states after handling epsilon-loops), while CFLs are not.',
              mistakeCategory: 'DCFL vs CFL Closure Table',
            },
          ],
          revisionRecommendation: 'Revise Decidability & Rice’s Theorem table before Saturday’s GATE PYQ session.',
        },
      },
    ],
  },
  {
    goalId: 'fullstack',
    title: 'Full-Stack Software Engineering & Architecture',
    shortTitle: 'Full-Stack Dev',
    priorityTier: 'MAIN_TECHNICAL_SKILL',
    priorityRank: 4,
    isMainTechnicalTrack: true,
    isActiveMainSkill: true, // ACTIVE MAIN SKILL (One-main-skill-at-a-time rule)
    sourceType: 'CURATED_ROADMAP',
    authoritySource: 'MDN Web Docs, React 19 Docs, Node.js & OWASP API Security',
    authorityUrl: 'https://developer.mozilla.org',
    syllabusVersion: 'v2026.8',
    lastCheckedDate: '2026-11-15',
    description: 'Active main technical skill track: Modern HTML/CSS, Advanced TypeScript, React 19, Express/PostgreSQL APIs, Auth, and Production Architecture.',
    continuousSpecializations: [
      'Event-Driven Microservices & Message Queues',
      'WebSockets & CRDT Real-Time Collaborative State',
      'Edge Caching & Container Orchestration',
    ],
    topics: [
      {
        id: 'fs-web-html-css-js-scratch',
        goalId: 'fullstack',
        stageId: 'stage-web-scratch',
        stageTitle: 'Stage 1: Complete Beginner Web Development (From Scratch)',
        title: 'How the Web Works: HTML5 Structure, CSS Flexbox & JavaScript DOM Basics from Zero',
        subtopics: ['Semantic HTML5 Tags', 'CSS Box Model & Flexbox Alignment', 'JavaScript Variables, Functions & Click Event Listeners'],
        prerequisites: [],
        estimatedDurationMinutes: 30,
        objectives: [
          'Build a semantic HTML5 page structure (`header`, `main`, `section`, `button`) from scratch',
          'Align elements cleanly in a row or column using CSS `display: flex`',
          'Write a JavaScript function that updates page text when a user clicks a button',
        ],
        masteryCriteria: 'Score >= 80% on the HTML/CSS/JS beginner quiz and complete the interactive button counter exercise.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction:
            'Every website and web application you use is built on three core pillars working together in the browser: HTML (the structure and content), CSS (the visual layout and styling), and JavaScript (the interactive logic and behavior).',
          simpleExplanation:
            'HTML defines *what* is on the page (`<h1>Hello ADHI</h1>`, `<button>Click me</button>`). CSS defines *how* it looks (`display: flex; justify-content: space-between;`). JavaScript makes it *react* to the user (`button.addEventListener("click", ...)`).',
          realWorldAnalogy:
            'Building a house: HTML is the brick walls and rooms, CSS is the paint, lighting, and interior design, and JavaScript is the electrical wiring that turns on the lights when you flip a switch.',
          workedExample:
            'When a user clicks a `<button id="counterBtn">Count: 0</button>`, JavaScript increments a variable `count++` and sets `counterBtn.textContent = "Count: " + count`.',
          stepByStepDemonstration: [
            '1. Create the HTML element: `<button id="studyBtn">Sessions: 0</button>`.',
            '2. Style the container with CSS Flexbox: `.row { display: flex; gap: 12px; align-items: center; }`.',
            '3. Select the button in JavaScript: `const btn = document.getElementById("studyBtn");`.',
            '4. Attach a click listener that increments `sessions` and updates `btn.textContent`.',
          ],
          programmingDetails: {
            codeExample: `let completedSessions = 0;
const button = document.getElementById('studyBtn');

if (button) {
  button.addEventListener('click', () => {
    completedSessions = completedSessions + 1;
    button.textContent = \`Sessions Completed: \${completedSessions}\`;
  });
}`,
            lineByLineExplanation: [
              'Line 1: Declares a state variable `completedSessions` starting at `0`.',
              'Line 2: Finds the HTML `<button id="studyBtn">` element in the Document Object Model (DOM).',
              'Line 5: Registers a callback function that runs every time the user clicks the button.',
              'Line 6-7: Increments the counter by 1 and updates the visible text inside the button.',
            ],
            dryRunTrace: 'Initial DOM: "Sessions Completed: 0" -> User Click #1: completedSessions becomes 1, DOM text updates to "Sessions Completed: 1" -> User Click #2: completedSessions becomes 2.',
            testCases: [
              { input: 'Initial load before any click', expectedOutput: 'completedSessions === 0', explanation: 'Variable starts at 0.' },
              { input: 'After 3 button clicks', expectedOutput: '"Sessions Completed: 3"', explanation: 'Event listener runs once per click.' },
            ],
            debuggingExercise: {
              buggyCode: `const count = 0;\ncount = count + 1; // TypeError: Assignment to constant variable`,
              hint: 'Use `let` instead of `const` when declaring a variable whose value needs to be reassigned.',
              fixedCode: `let count = 0;\ncount = count + 1;`,
            },
            codingChallenge: {
              prompt: 'Which CSS property on a parent container activates Flexbox layout for its children?',
              starterCode: `.container {\n  display: ____;\n}`,
              solutionKey: 'flex',
              complexityAnalysis: 'DOM ID lookup `getElementById` runs in O(1) hash table lookup time.',
            },
          },
          guidedExercise: {
            question: 'What is the difference between `const` and `let` when declaring variables in JavaScript/TypeScript?',
            steps: [
              '`const` creates a binding that cannot be reassigned to a new value.',
              '`let` creates a block-scoped variable that can be reassigned (such as a loop counter `let i = 0`).',
            ],
            expectedAnswer: '`const` prevents reassignment, whereas `let` allows reassignment when a variable’s value changes over time.',
          },
          independentExercise: {
            prompt: 'Write the CSS rule to arrange child cards in a horizontal row with 16px space between them and vertically centered alignment.',
            evaluationRubric: ['Uses `display: flex`', 'Includes `gap: 16px` and `align-items: center`'],
          },
          quizQuestions: [
            {
              id: 'q-fs-beg-1',
              question: 'In web development, what is the primary responsibility of HTML, CSS, and JavaScript respectively?',
              options: [
                'HTML provides semantic structure, CSS controls layout/styling, and JavaScript handles interactivity and logic',
                'HTML styles colors, CSS runs database queries, and JavaScript compiles the operating system',
                'HTML is only for mobile apps, while CSS is only for servers',
                'All three are identical database query languages',
              ],
              correctIndex: 0,
              explanation: 'HTML defines document structure, CSS handles visual presentation (like Flexbox/Grid), and JavaScript manipulates the DOM and state.',
              mistakeCategory: 'Web Fundamentals (HTML/CSS/JS)',
            },
            {
              id: 'q-fs-beg-2',
              question: 'Why does reassigning a variable declared with `const count = 0; count = 1;` throw a TypeError in JavaScript?',
              options: [
                'Variables declared with `const` cannot be reassigned; `let` must be used for mutable counters',
                'JavaScript does not support numbers',
                '`0` and `1` are strings in JavaScript',
                'Variables can only be named `x`',
              ],
              correctIndex: 0,
              explanation: '`const` declares a constant reference that cannot be reassigned; mutable variables use `let`.',
              mistakeCategory: 'JavaScript Variable Declarations',
            },
          ],
          revisionRecommendation: 'Build your first interactive web card in the Beginner Portfolio Project to unlock Stage 2 Backend APIs & Auth.',
        },
      },
      {
        id: 'fs-jwt-oauth-architecture',
        goalId: 'fullstack',
        stageId: 'stage-backend-auth',
        stageTitle: 'Stage 2: Backend APIs, Relational Persistence & Authentication',
        title: 'Stateless JWT Verification, OAuth 2.0 Flows & SQL Injection Defense',
        subtopics: ['Bearer ID Token Verification', 'Parameterized Queries vs String Interpolation', 'CORS & SameSite Cookie Security'],
        prerequisites: ['fs-web-html-css-js-scratch'],
        estimatedDurationMinutes: 30,
        objectives: [
          'Verify asymmetric RS256 ID tokens in Express middleware without trusting client-supplied UIDs',
          'Eliminate SQL injection vulnerabilities using ORM parameterized queries',
        ],
        masteryCriteria: 'Score >= 80% on API security quiz and fix the IDOR vulnerability in the debugging exercise.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction:
            'Production full-stack backends must never trust user IDs sent in request bodies or query strings; every protected endpoint verifies the cryptographic Bearer token signature and scopes database queries to the verified `req.user.uid`.',
          simpleExplanation:
            'When a client signs in via OAuth/Firebase Auth, the Identity Provider issues a signed JWT. The server validates the signature against public keys and extracts `uid` on the server side.',
          realWorldAnalogy:
            'Checking a tamper-proof government passport hologram at border control (JWT verification) vs accepting a handwritten name tag (untrusted request body `userId`).',
          workedExample:
            'In Express: `const decoded = await adminAuth.verifyIdToken(token);` guarantees `decoded.uid` belongs to the authenticated user before running `WHERE user_uid = decoded.uid`.',
          stepByStepDemonstration: [
            '1. Extract `Authorization: Bearer <token>` from incoming HTTP headers.',
            '2. Verify cryptographic signature, expiration (`exp`), and audience (`aud`).',
            '3. Attach verified `req.user` to the request context.',
            '4. Scope all SELECT/UPDATE/DELETE queries by `req.user.uid`.',
          ],
          programmingDetails: {
            codeExample: `app.put('/api/sessions/:id', requireAuth, async (req: AuthRequest, res) => {
  const uid = req.user!.uid;
  const sessionId = Number(req.params.id);
  // Scoped by BOTH sessionId AND authenticated uid to prevent IDOR
  const updated = await db
    .update(learningSessions)
    .set({ status: req.body.status })
    .where(and(eq(learningSessions.id, sessionId), eq(learningSessions.userUid, uid)))
    .returning();
  res.json(updated[0]);
});`,
            lineByLineExplanation: [
              'Line 1: Attaches `requireAuth` middleware before the route handler runs.',
              'Line 2: Reads `uid` exclusively from the verified token (`req.user.uid`), never from `req.body.uid`.',
              'Line 7: Combines `sessionId` and `userUid` in the `WHERE` clause to prevent Insecure Direct Object Reference (IDOR).',
            ],
            dryRunTrace: 'Attacker with uid="u_evil" requests PUT /api/sessions/99 (owned by "u_adhi") -> WHERE id=99 AND user_uid="u_evil" matches 0 rows -> target data remains untouched.',
            testCases: [
              { input: 'Missing Authorization header', expectedOutput: '401 Unauthorized', explanation: 'Middleware rejects unauthenticated request immediately.' },
              { input: 'Valid token but mismatched resource owner', expectedOutput: '0 rows modified (404/403)', explanation: 'Composite WHERE clause prevents horizontal privilege escalation.' },
            ],
            debuggingExercise: {
              buggyCode: `app.get('/api/profile', async (req, res) => {\n  const rows = await db.select().from(users).where(eq(users.uid, req.query.uid as string));\n  res.json(rows[0]);\n});`,
              hint: 'Never read `uid` from `req.query` without verifying the caller’s identity via `requireAuth` and `req.user.uid`.',
              fixedCode: `app.get('/api/profile', requireAuth, async (req: AuthRequest, res) => {\n  const rows = await db.select().from(users).where(eq(users.uid, req.user!.uid));\n  res.json(rows[0]);\n});`,
            },
            codingChallenge: {
              prompt: 'Identify the OWASP vulnerability when an API endpoint filters only by `eq(projects.id, req.params.id)` without checking `eq(projects.userUid, req.user.uid)`.',
              starterCode: `const vulnerabilityName = "____";`,
              solutionKey: 'IDOR (Broken Object Level Authorization)',
              complexityAnalysis: 'Indexed primary key + user_uid lookup: O(log N) B+ Tree seek.',
            },
          },
          guidedExercise: {
            question: 'Why does decoding a JWT with `atob()` or `jwt.decode()` on the server NOT authenticate the request?',
            steps: [
              'Base64 decoding only reads the JSON payload.',
              'Anyone can forge a JSON payload and Base64-encode it.',
              'Only `verifyIdToken` / signature verification proves the token was signed by the private key.',
            ],
            expectedAnswer: 'Base64 decoding does not verify the cryptographic signature; an attacker can tamper with the payload unless the signature is verified.',
          },
          independentExercise: {
            prompt: 'Write a checklist of 3 validations an Express POST endpoint must perform before inserting user data into PostgreSQL.',
            evaluationRubric: ['Verify Bearer token', 'Validate schema/types & string bounds', 'Use parameterized ORM queries'],
          },
          quizQuestions: [
            {
              id: 'q-fs-1',
              question: 'What prevents an authenticated user from modifying another user’s record when calling `PUT /api/items/:id`?',
              options: [
                'Scoping the database WHERE clause with both the item ID and the verified `req.user.uid` from the auth token',
                'Hiding the item ID in frontend CSS',
                'Passing `userId` inside the JSON request body',
                'Using HTTP PUT instead of HTTP POST',
              ],
              correctIndex: 0,
              explanation: 'Enforcing ownership in the database query using the server-verified token UID prevents Broken Object Level Authorization (IDOR).',
              mistakeCategory: 'API Authorization & IDOR',
            },
          ],
          revisionRecommendation: 'Apply this pattern directly in your Full-Stack Portfolio Project API routes.',
        },
      },
    ],
  },
  {
    goalId: 'cybersecurity',
    title: 'Cybersecurity & Ethical Hacking',
    shortTitle: 'Cybersecurity',
    priorityTier: 'MAIN_TECHNICAL_SKILL',
    priorityRank: 5,
    isMainTechnicalTrack: true,
    isActiveMainSkill: false, // Queued per One-Main-Skill-at-a-time rule until Full-Stack completes
    sourceType: 'CURATED_ROADMAP',
    authoritySource: 'OWASP Top 10 (2025/2026) & NIST Cybersecurity Framework',
    authorityUrl: 'https://owasp.org/www-project-top-ten/',
    syllabusVersion: 'OWASP-2026.1',
    lastCheckedDate: '2026-11-15',
    description: 'Queued Main Skill Track (activates after Full-Stack progression or upon explicit major roadmap switch): Networking, Linux, Web Security, Labs, and Defensive Hardening.',
    continuousSpecializations: [
      'Cloud IAM Privilege Escalation Auditing',
      'Zero-Trust Container & Supply Chain Security',
    ],
    topics: [
      {
        id: 'cyber-owasp-xss-csrf',
        goalId: 'cybersecurity',
        stageId: 'stage-web-sec',
        stageTitle: 'Stage 1: Networking, Linux & Web Application Security',
        title: 'Cross-Site Scripting (XSS), Content Security Policy (CSP) & CSRF Defenses',
        subtopics: ['Reflected vs Stored vs DOM XSS', 'Strict CSP Nonces', 'SameSite=Lax/Strict & Anti-CSRF Tokens', 'Ethical Boundaries'],
        prerequisites: [],
        estimatedDurationMinutes: 30,
        objectives: [
          'Distinguish Stored, Reflected, and DOM-based XSS vectors',
          'Configure Content-Security-Policy headers and SameSite cookie attributes',
        ],
        masteryCriteria: 'Score >= 80% on defensive web security quiz.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction: 'Web security defends client browsers and session integrity against script injection (XSS) and forged cross-origin state-changing requests (CSRF) within strict legal and ethical authorization boundaries.',
          simpleExplanation: 'XSS occurs when untrusted input is rendered as executable code in the victim’s DOM; CSRF occurs when a third-party site tricks the victim’s browser into sending authenticated cookies to a target endpoint.',
          realWorldAnalogy: 'XSS is slipping a fake instruction sheet inside an official company binder; CSRF is tricking a logged-in clerk into stamping a transfer form while they are looking away.',
          workedExample: 'Setting `Content-Security-Policy: default-src \'self\'; script-src \'nonce-r4nd0m\'` blocks injected inline `<script>` tags from executing.',
          stepByStepDemonstration: [
            '1. Contextually encode all untrusted output (React escapes JSX text nodes by default).',
            '2. Avoid `dangerouslySetInnerHTML` or sanitize with DOMPurify.',
            '3. Enforce `HttpOnly; Secure; SameSite=Lax` on session cookies or use Bearer tokens in Authorization headers.',
          ],
          guidedExercise: {
            question: 'Why are APIs that authenticate strictly via `Authorization: Bearer <token>` headers naturally resistant to traditional form-based CSRF?',
            steps: ['Browsers automatically attach cookies to cross-site form submissions.', 'Browsers never automatically attach custom `Authorization` headers across origins.'],
            expectedAnswer: 'Custom Authorization headers are not automatically sent by the browser on cross-origin requests.',
          },
          independentExercise: {
            prompt: 'Write a strict CSP header that blocks inline scripts and restricts images to self and https:',
            evaluationRubric: ['Includes default-src \'self\'', 'Omits unsafe-inline for script-src'],
          },
          quizQuestions: [
            {
              id: 'q-cyber-1',
              question: 'Which defense directly mitigates DOM-based and Stored Cross-Site Scripting (XSS)?',
              options: [
                'Contextual output encoding and a strict Content Security Policy (CSP)',
                'Increasing database connection pool size',
                'Using HTTP compression',
                'Disabling TLS 1.3',
              ],
              correctIndex: 0,
              explanation: 'Output encoding prevents data from being parsed as executable script, and CSP restricts script execution sources.',
              mistakeCategory: 'Web Security Defenses',
            },
          ],
          revisionRecommendation: 'Queued until Full-Stack main skill track milestone is completed.',
        },
      },
    ],
  },
  {
    goalId: 'ai_ml',
    title: 'AI, Machine Learning & Generative AI Systems',
    shortTitle: 'AI & ML',
    priorityTier: 'MAIN_TECHNICAL_SKILL',
    priorityRank: 6,
    isMainTechnicalTrack: true,
    isActiveMainSkill: false, // Queued per One-Main-Skill-at-a-time rule
    sourceType: 'CURATED_ROADMAP',
    authoritySource: 'Stanford CS229 / DeepLearning.AI & Modern LLM Engineering Curriculum',
    authorityUrl: 'https://cs229.stanford.edu',
    syllabusVersion: 'v2026.5',
    lastCheckedDate: '2026-11-15',
    description: 'Queued Main Skill Track: Linear Algebra, Probability, Python Data Science, Supervised/Unsupervised ML, Transformers, and RAG Systems.',
    continuousSpecializations: [
      'Agentic Evaluation Benchmarks & Structured Output Guardrails',
      'Quantization (AWQ/GGUF) & Efficient Inference Serving',
    ],
    topics: [
      {
        id: 'aiml-gradient-descent-backprop',
        goalId: 'ai_ml',
        stageId: 'stage-ml-foundations',
        stageTitle: 'Stage 1: Mathematical Foundations & Classical ML',
        title: 'Vectorized Gradient Descent, Bias-Variance Tradeoff & L2 Regularization',
        subtopics: ['Convex Loss Surfaces', 'Learning Rate & Convergence', 'Ridge (L2) vs Lasso (L1) Sparsity'],
        prerequisites: [],
        estimatedDurationMinutes: 30,
        objectives: [
          'Derive the vectorized gradient update for MSE and Cross-Entropy loss',
          'Diagnose high variance (overfitting) vs high bias (underfitting) from validation curves',
        ],
        masteryCriteria: 'Score >= 80% on regularization & gradient quiz.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction: 'Gradient descent iteratively updates model parameters θ in the direction opposite to the loss gradient ∇J(θ), while regularization penalizes excessive parameter magnitude to generalize to unseen data.',
          simpleExplanation: 'Update rule: `θ := θ - α * ∇J(θ)`. L1 regularization adds `λ|θ|` (producing sparse zero weights for feature selection), while L2 adds `λθ^2` (shrinking weights smoothly).',
          realWorldAnalogy: 'Walking down a foggy valley by feeling the steepest downward slope under your feet at each step, taking smaller steps as the slope flattens.',
          workedExample: 'For L2 loss penalty `(λ/2m) * ||w||^2`, the weight update becomes `w := w(1 - αλ/m) - α * (∂L_0/∂w)`, known as weight decay.',
          stepByStepDemonstration: [
            '1. Compute forward predictions y_hat = Xw + b.',
            '2. Compute residual error e = y_hat - y.',
            '3. Compute vectorized gradient dW = (1/m) * X^T * e + (λ/m) * w.',
            '4. Update parameters w := w - α * dW.',
          ],
          guidedExercise: {
            question: 'Why does L1 (Lasso) regularization drive weights to exact zero more readily than L2 (Ridge)?',
            steps: ['Compare the subgradient of |w| (constant ±λ) with the derivative of w^2 (2λw, which shrinks near zero).'],
            expectedAnswer: 'L1 has a constant gradient force (±λ) all the way to 0, creating diamond-shaped constraint corners on the coordinate axes.',
          },
          independentExercise: {
            prompt: 'State two remedies when training loss is 0.01 but validation loss is 0.48.',
            evaluationRubric: ['Identifies High Variance / Overfitting', 'Recommends L2 regularization, dropout, or more training data'],
          },
          quizQuestions: [
            {
              id: 'q-aiml-1',
              question: 'Which regularization technique induces sparsity by driving less important feature weights to exact zero?',
              options: ['L1 (Lasso) Regularization', 'L2 (Ridge) Regularization', 'Batch Size Doubling', 'Increasing Learning Rate'],
              correctIndex: 0,
              explanation: 'L1 regularization uses the L1 norm penalty λ||w||_1 whose diamond-shaped level sets intersect loss contours on axes.',
              mistakeCategory: 'Regularization Geometry',
            },
          ],
          revisionRecommendation: 'Scheduled when AI/ML becomes the active Main Technical Track.',
        },
      },
    ],
  },
  {
    goalId: 'japanese',
    title: 'Japanese Language Proficiency (JLPT N5 Track)',
    shortTitle: 'Japanese (JLPT N5)',
    priorityTier: 'CONTINUOUS_LANGUAGE',
    priorityRank: 7,
    isMainTechnicalTrack: false,
    isActiveMainSkill: true,
    sourceType: 'OFFICIAL_SYLLABUS',
    authoritySource: 'Japan Foundation & JEES Official JLPT N5 Test Guide',
    authorityUrl: 'https://www.jlpt.jp/e/about/levelsummary.html',
    syllabusVersion: 'JLPT-N5-2026',
    lastCheckedDate: '2026-11-15',
    description: 'Daily 30–45m Japanese language progression covering Hiragana/Katakana, 100 N5 Kanji, 800 Vocabulary items, Particles & Verb Conjugations, and Listening.',
    continuousSpecializations: [
      'JLPT N4 Transition: Transitive/Intransitive Verb Pairs & Keigo Basics',
      'Technical IT Vocabulary in Japanese (エンジニア実務語彙)',
    ],
    topics: [
      {
        id: 'jp-hiragana-greetings-scratch',
        goalId: 'japanese',
        stageId: 'stage-jlpt-n5-kana',
        stageTitle: 'Stage 1: Complete Beginner Japanese — Hiragana Alphabet & Greetings (From Zero)',
        title: 'Japanese From Zero: Hiragana Vowels (あ・い・う・え・お), Basic Reading & Daily Greetings',
        subtopics: ['5 Pure Vowel Sounds (a, i, u, e, o)', 'K-Row & S-Row Hiragana Characters', 'Essential Greetings (Ohayou, Konnichiwa, Arigatou)'],
        prerequisites: [],
        estimatedDurationMinutes: 30,
        objectives: [
          'Read and pronounce the 5 foundational Japanese vowels: あ (a), い (i), う (u), え (e), お (o)',
          'Read your first Japanese words built from vowel and consonant rows (`あおい` - blue, `うえ` - above, `いえ` - house)',
          'Use polite daily Japanese greetings accurately in context',
        ],
        masteryCriteria: 'Score >= 80% on the Hiragana & Greetings beginner quiz and complete the 5-word reading exercise.',
        sourceType: 'OFFICIAL_SYLLABUS',
        lesson: {
          conceptIntroduction:
            'Welcome to Japanese from absolute zero! Japanese uses a phonetic alphabet called Hiragana (ひらがな) where every character represents one clear syllable sound. Unlike English, Japanese vowel sounds never change regardless of which word they appear in!',
          simpleExplanation:
            'Every sound in Japanese is built on 5 pure vowels: **あ (a)** as in father, **い (i)** as in meet, **う (u)** as in flute, **え (e)** as in desk, and **お (o)** as in solo. Once you know these 5 vowels, every other Hiragana row simply pairs a consonant (k, s, t, n...) with these exact 5 vowels (`か ka, き ki, く ku, け ke, こ ko`)!',
          realWorldAnalogy:
            'Think of Hiragana as a musical grid: the 5 columns are the 5 vowel notes (a, i, u, e, o), and each row is a different instrument playing those exact same 5 notes.',
          workedExample:
            'Combining vowels creates real words immediately: **いえ (i-e)** = house, **うえ (u-e)** = above/up, **あおい (a-o-i)** = blue, **いいえ (i-i-e)** = no.',
          stepByStepDemonstration: [
            '1. Practice the 5 vowel characters aloud: あ (a), い (i), う (u), え (e), お (o).',
            '2. Add the K-row: か (ka), き (ki), く (ku), け (ke), こ (ko).',
            '3. Read two-syllable words: `あき (a-ki)` = autumn, `こえ (ko-e)` = voice, `いけ (i-ke)` = pond.',
            '4. Practice polite greetings: `おはようございます (Ohayou gozaimasu)` = Good morning (polite).',
          ],
          theoreticalDetails: {
            definitions: [
              { term: 'Hiragana (ひらがな)', definition: 'The foundational 46-character Japanese phonetic syllabary used for native words and grammar.' },
              { term: 'Hajimemashite (はじめまして)', definition: '"Nice to meet you for the first time" — used at the start of a self-introduction.' },
            ],
            comparisons: [
              { aspect: 'Morning Greeting', itemA: 'おはよう (Ohayou) — Casual with friends', itemB: 'おはようございます (Ohayou gozaimasu) — Polite standard' },
            ],
            diagramAscii: `Vowel Grid:   [ あ a ]   [ い i ]   [ う u ]   [ え e ]   [ お o ]\nK-Row Grid:   [ か ka]   [ き ki]   [ く ku]   [ け ke]   [ こ ko]`,
            applicationQuestions: ['How do you introduce yourself politely in Japanese? ("Hajimemashite. Watashi wa ADHI desu. Yoroshiku onegaishimasu.")'],
          },
          guidedExercise: {
            question: 'How do you read the Japanese word `あおい` (meaning "blue") syllable by syllable?',
            steps: ['あ = a', 'お = o', 'い = i'],
            expectedAnswer: 'a-o-i (aoi — meaning blue).',
          },
          independentExercise: {
            prompt: 'Write the romaji reading and English meaning for: (1) いえ, (2) うえ, and (3) おはようございます.',
            evaluationRubric: ['いえ = ie (house)', 'うえ = ue (above/up)', 'おはようございます = Ohayou gozaimasu (Good morning)'],
          },
          quizQuestions: [
            {
              id: 'q-jp-beg-1',
              question: 'What is the correct reading and meaning of the Hiragana word `いえ`?',
              options: [
                'ie — meaning "house"',
                'aoi — meaning "blue"',
                'koe — meaning "voice"',
                'aki — meaning "autumn"',
              ],
              correctIndex: 0,
              explanation: 'い is "i" and え is "e", forming いえ (ie), which means house/home in JLPT N5.',
              mistakeCategory: 'Hiragana Vowel Recognition',
            },
            {
              id: 'q-jp-beg-2',
              question: 'Which Japanese expression is used when meeting someone for the very first time ("Nice to meet you")?',
              options: [
                'はじめまして (Hajimemashite)',
                'おやすみなさい (Oyasuminasai)',
                'ごちそうさまでした (Gochisousama deshita)',
                'さようなら (Sayounara)',
              ],
              correctIndex: 0,
              explanation: 'はじめまして (Hajimemashite — literally "for the first time") opens a Japanese self-introduction.',
              mistakeCategory: 'JLPT N5 Basic Greetings',
            },
          ],
          revisionRecommendation: 'Master Hiragana reading and greetings first to unlock Stage 2: Core JLPT N5 Particles & Verbs.',
        },
      },
      {
        id: 'jp-n5-particles-verbs',
        goalId: 'japanese',
        stageId: 'stage-jlpt-n5-grammar',
        stageTitle: 'Stage 2: Core JLPT N5 Particles, Verb Masu-Form & Te-Form',
        title: 'JLPT N5 Core Particles (は, が, を, に, で, へ) & Verb ます/て Conjugation',
        subtopics: ['Topic marker は vs Identifier が', 'Location of action で vs Destination/Time に', 'Godan vs Ichidan Verb Groups'],
        prerequisites: ['jp-hiragana-greetings-scratch'],
        estimatedDurationMinutes: 30,
        objectives: [
          'Distinguish に (static existence, specific time, destination) from で (location of active event, means/tool)',
          'Conjugate Group 1 (Godan), Group 2 (Ichidan), and Group 3 (Irregular) verbs into て-form accurately',
        ],
        masteryCriteria: 'Score >= 80% on JLPT N5 particle & verb conjugation quiz.',
        sourceType: 'OFFICIAL_SYLLABUS',
        lesson: {
          conceptIntroduction:
            'Japanese grammar relies on postpositional particles that mark the grammatical role of each noun phrase, paired with sentence-final verb conjugations.',
          simpleExplanation:
            'Use に (ni) for specific points in time (`５時に起きます` - wake up at 5:00), destinations (`大学に行きます` - go to college), and static existence (`部屋に机があります`). Use で (de) for the place where an action happens (`図書館で勉強します` - study at the library) or by means of a tool (`バスで行きます`).',
          realWorldAnalogy:
            'Think of に as a pinpoint laser pointer (pointing to a target destination or clock time) and で as a stage spotlight illuminating the arena where an action takes place.',
          workedExample:
            '`私は 毎日 ５時に 起きて、家で コーディングを 勉強します。` (Every day I wake up at 5:00 [に = point in time] and study coding at home [で = location of action, を = direct object]).',
          stepByStepDemonstration: [
            '1. Identify whether the verb describes movement to a target/existence (に) or an active event occurring within a space (で).',
            '2. For て-form of Group 1 (u-verbs): う/つ/る -> って, む/ぶ/ぬ -> んで, く -> いて (exception: 行く -> 行って), ぐ -> いで, す -> して.',
            '3. For Group 2 (ru-verbs): drop る and add て (`食べる -> 食べて`).',
          ],
          theoreticalDetails: {
            definitions: [
              { term: 'に (ni)', definition: 'Marks specific time point, destination of movement, indirect object, or location of existence (ある/いる).' },
              { term: 'で (de)', definition: 'Marks location where an active verb takes place, or instrument/means of transport.' },
            ],
            comparisons: [
              { aspect: 'Library Example', itemA: '図書館に 本が あります (Books exist IN the library)', itemB: '図書館で 本を 読みます (Read books AT the library)' },
            ],
            diagramAscii: `[Time: 5時に] ---> (Pinpoint に)\n[Place of Action: 図書館で] ---> [Object: 本を] ---> [Verb: 読みます]`,
            applicationQuestions: ['Why does `行く (iku)` conjugate to `行って (itte)` instead of `いいて` in JLPT N5?'],
          },
          guidedExercise: {
            question: 'Fill in the correct particle: 毎日、大学（ 1 ）バス（ 2 ）行きます。 (Every day I go to college by bus.)',
            steps: ['1 marks destination of 行きます -> に or へ', '2 marks means of transport -> で'],
            expectedAnswer: '(1) に / へ, (2) で',
          },
          independentExercise: {
            prompt: 'Conjugate 飲む (nomu - to drink), 書く (kaku - to write), and 行く (iku - to go) into て-form.',
            evaluationRubric: ['飲む -> 飲んで (んで)', '書く ->書いて (いて)', '行く -> 行って (exception って)'],
          },
          quizQuestions: [
            {
              id: 'q-jp-1',
              question: 'Choose the correct particle: 昨日、図書館（　）日本語を勉強しました。 (Yesterday, I studied Japanese at the library.)',
              options: ['で (de)', 'に (ni)', 'を (wo)', 'へ (e)'],
              correctIndex: 0,
              explanation: 'Studying (勉強します) is an active event taking place at a location, which requires the particle で.',
              mistakeCategory: 'JLPT N5 Particle に vs で',
            },
            {
              id: 'q-jp-2',
              question: 'What is the correct て-form (te-form) of the verb 行く (iku — to go)?',
              options: ['行って (itte)', 'いいて (iite)', '行んで (inde)', '行して (ishite)'],
              correctIndex: 0,
              explanation: '行く is the classic Group 1 phonetic exception in JLPT N5, conjugating to 行って (itte).',
              mistakeCategory: 'Godan Verb Te-Form Exceptions',
            },
          ],
          revisionRecommendation: 'Review 15 N5 vocabulary flashcards and practice aloud during the 7:10–7:40 PM Japanese slot.',
        },
      },
    ],
  },
  {
    goalId: 'english',
    title: 'English Communication & Technical Interview Fluency',
    shortTitle: 'English Speaking',
    priorityTier: 'CONTINUOUS_LANGUAGE',
    priorityRank: 8,
    isMainTechnicalTrack: false,
    isActiveMainSkill: true,
    sourceType: 'CURATED_ROADMAP',
    authoritySource: 'CEFR C1 Professional Communication & STAR Technical Interview Framework',
    authorityUrl: 'https://www.coe.int/en/web/common-european-framework-reference-languages',
    syllabusVersion: 'v2026.3',
    lastCheckedDate: '2026-11-15',
    description: 'Daily 25–30m speaking, pronunciation clarity, structural STAR/PREP articulation, and technical walk-through communication.',
    continuousSpecializations: [
      'System Architecture Trade-off Articulation Under Questioning',
      'Executive Project Pitch & Behavioral Leadership Storytelling',
    ],
    topics: [
      {
        id: 'eng-star-technical-articulation',
        goalId: 'english',
        stageId: 'stage-interview-comm',
        stageTitle: 'Stage 1: Structured Speaking, Pronunciation & Interview Articulation',
        title: 'PREP & STAR Frameworks for Explaining Technical Decisions & Coding Trade-offs',
        subtopics: ['Point-Reason-Example-Point (PREP)', 'Situation-Task-Action-Result (STAR)', 'Eliminating Filler Words via Strategic Pauses'],
        prerequisites: [],
        estimatedDurationMinutes: 25,
        objectives: [
          'Articulate any technical trade-off in under 90 seconds using the PREP structure',
          'Deliver behavioral project answers using measurable STAR outcomes without rambling',
        ],
        masteryCriteria: 'Score >= 80% on communication structure assessment and complete 1 spoken articulation log.',
        sourceType: 'CURATED_ROADMAP',
        lesson: {
          conceptIntroduction:
            'In product-company interviews, how clearly you verbalize your thought process while coding or discussing projects is evaluated alongside code correctness.',
          simpleExplanation:
            'Use PREP for technical questions: **P**oint (state your choice immediately), **R**eason (why it beats alternatives in time/space), **E**xample (concrete edge case or metric), **P**oint (restate conclusion). Use STAR for project/HR stories.',
          realWorldAnalogy:
            'An executive headline followed by supporting bullet points—never make the interviewer wait 3 minutes to discover what your conclusion is.',
          workedExample:
            'Question: "Why did you use a Monotonic Deque instead of a Max-Heap here?" -> Point: "I chose a monotonic deque to achieve O(N) linear time." -> Reason: "A max-heap takes O(N log K) and requires lazy deletion of stale indices." -> Example: "For 10^5 elements, the deque performs at most 2*10^5 array ops." -> Point: "So the deque is optimal in both latency and code simplicity."',
          stepByStepDemonstration: [
            '1. Pause for 2 seconds after the question instead of saying "umm / basically".',
            '2. Lead with the headline answer in one crisp sentence (Point).',
            '3. Contrast two concrete trade-offs (Time vs Space, Latency vs Consistency).',
            '4. Close with the measurable result or complexity bound.',
          ],
          guidedExercise: {
            question: 'Restructure this rambling sentence into a crisp PREP opening: "Well basically I looked at PostgreSQL and NoSQL and we had lots of relational joins so eventually I picked PostgreSQL."',
            steps: ['State the decision first', 'State the core engineering reason second'],
            expectedAnswer: 'I selected PostgreSQL because our domain requires strict ACID transactions and relational foreign-key joins across 11 normalized tables.',
          },
          independentExercise: {
            prompt: 'Speak aloud for 60 seconds explaining your current Full-Stack project using Situation, Task, Action, and Result (STAR).',
            evaluationRubric: ['Clear headline within 10 seconds', 'Zero filler words', 'Quantified outcome at the end'],
          },
          quizQuestions: [
            {
              id: 'q-eng-1',
              question: 'When an interviewer asks "Why did you choose Approach A over Approach B?", what is the strongest opening sentence using the PREP framework?',
              options: [
                'I chose Approach A because it reduces worst-case time complexity from O(N^2) to O(N) while using O(K) auxiliary memory.',
                'Well, first I tried Approach B for twenty minutes and then I thought maybe Approach A could work...',
                'Approach A is always the best in every situation.',
                'Let me write the code first and explain later.',
              ],
              correctIndex: 0,
              explanation: 'Leading directly with the decision and its concrete engineering trade-off immediately establishes clarity and seniority.',
              mistakeCategory: 'Interview Articulation Structure',
            },
          ],
          revisionRecommendation: 'Practice 2-minute spoken walkthroughs during the 8:00–8:25 PM English speaking session.',
        },
      },
    ],
  },
];

export const INITIAL_SYLLABUS_UPDATES: SyllabusUpdateRecord[] = [
  {
    id: 'upd-gate-2026-official',
    goalId: 'gate_cse',
    sourceName: 'Official GATE 2026 Organizing Institute Portal',
    sourceUrl: 'https://gate2026.iitr.ac.in',
    previousVersion: 'GATE-CS-2025.2',
    newVersion: 'GATE-CS-2026.1',
    detectedDate: '2026-11-12',
    changeType: 'MINOR_AUTO',
    status: 'APPLIED_AUTOMATICALLY',
    changeDescription: 'Verified official CS syllabus section weightages and added latest 2025/2026 Two-Mark MSQ (Multiple Select Question) practice sets for TOC and DBMS.',
    affectedTopics: ['gate-toc-pumping-lemma', 'pl-dbms-indexing'],
    recommendedAction: 'Automatically applied minor PYQ resource enrichment while preserving all completed mastery records.',
  },
  {
    id: 'upd-fs-react19-server-actions',
    goalId: 'fullstack',
    sourceName: 'React 19 & OWASP API Security 2026 Advisory',
    sourceUrl: 'https://react.dev',
    previousVersion: 'v2026.7',
    newVersion: 'v2026.9-Major',
    detectedDate: '2026-11-15',
    changeType: 'MAJOR_APPROVAL_REQUIRED',
    status: 'PENDING_USER_APPROVAL',
    changeDescription: 'Proposes adding a new Stage 4 specialization module on Server-Side AI Streaming & Token Rate-Limiting Middleware (+2 topics, +90m estimated roadmap duration).',
    affectedTopics: ['fs-jwt-oauth-architecture'],
    recommendedAction: 'Requires your approval because this adds a new roadmap stage and extends the Full-Stack completion timeline.',
  },
];

export function createInitialMasteryRecords(): Record<string, TopicMasteryRecord> {
  const records: Record<string, TopicMasteryRecord> = {};
  for (const roadmap of INITIAL_ROADMAPS) {
    for (const topic of roadmap.topics) {
      records[topic.id] = {
        topicId: topic.id,
        goalId: roadmap.goalId,
        status: 'NOT_STARTED',
        assessmentAttempts: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        mistakeCategories: [],
        understandingLevel: 0,
        retentionScore: 0,
        practicalPerformance: 0,
        practicalCompleted: false,
        intervalDays: 1,
        easeFactor: 2.5,
        nextReviewDate: '2026-11-15',
      };
    }
  }
  return records;
}

/**
 * Enforces the One-Main-Skill-at-a-Time Rule:
 * Among ['fullstack', 'cybersecurity', 'ai_ml'], exactly one track is active at any time.
 * Switching the active main skill requires an explicit user decision and preserves all previous mastery.
 */
export function switchActiveMainSkillTrack(
  roadmaps: LearningRoadmap[],
  targetMainSkill: 'fullstack' | 'cybersecurity' | 'ai_ml'
): LearningRoadmap[] {
  return roadmaps.map((rm) => {
    if (!rm.isMainTechnicalTrack) {
      return rm;
    }
    return {
      ...rm,
      isActiveMainSkill: rm.goalId === targetMainSkill,
    };
  });
}

/**
 * Checks if all prerequisites for a topic are satisfied (MASTERED or IN_PROGRESS with >=70% understanding).
 */
export function arePrerequisitesMet(
  topic: RoadmapTopic,
  masteryMap: Record<string, TopicMasteryRecord>
): boolean {
  if (!topic.prerequisites || topic.prerequisites.length === 0) {
    return true;
  }
  return topic.prerequisites.every((prereqId) => {
    const rec = masteryMap[prereqId];
    return rec && (rec.status === 'MASTERED' || rec.understandingLevel >= 70);
  });
}

/**
 * LAYER 1 -> LAYER 2 AUTONOMOUS TOPIC SELECTION ENGINE:
 * Consumes published availability from Layer 1 and skill-gap signals from Layer 3
 * to autonomously decide what to learn in each timetable slot today.
 */
export function selectAutonomousDailySessions(
  availability: Layer1PublishedAvailability,
  roadmaps: LearningRoadmap[],
  masteryMap: Record<string, TopicMasteryRecord>,
  skillGaps: SkillGapRecommendationContract[] = []
): ScheduledLearningRecommendation[] {
  const activeMainRoadmap =
    roadmaps.find((r) => r.isMainTechnicalTrack && r.isActiveMainSkill) ||
    roadmaps.find((r) => r.goalId === 'fullstack')!;

  const recommendations: ScheduledLearningRecommendation[] = [];

  for (const slot of availability.slots) {
    // If Exam Mode is active and this is an EXAM_PREP slot, prioritize the active exam's highest-priority weak unit
    if (availability.assignedMode === 'EXAM_MODE' && slot.designatedCategory === 'EXAM_PREP') {
      const examSubject = availability.activeExam?.subjects[0];
      const weakUnit = examSubject?.units.find((u) => u.isWeakArea) || examSubject?.units[0];
      recommendations.push({
        sessionId: `rec-${availability.date}-${slot.slotId}`,
        date: availability.date,
        slotId: slot.slotId,
        displayTime: slot.displayTime,
        durationMinutes: slot.durationMinutes,
        goalId: 'gate_cse',
        topicId: 'gate-toc-pumping-lemma',
        topicTitle:
          examSubject && weakUnit
            ? `${examSubject.name}: Unit ${weakUnit.unitNumber} — ${weakUnit.title}`
            : 'Exam High-Priority Unit & PYQ Consolidation',
        sessionType: 'EXAM_UNIT_PREP',
        autonomousReason: `Exam Mode active (${availability.activeExam?.title || 'Scheduled Exam'}): Automatically prioritized high-weightage unit & PYQ drill while protecting 7.5h sleep.`,
        status: 'SCHEDULED',
      });
      continue;
    }

    // Determine target GoalId for this timetable slot respecting One-Main-Skill-at-a-Time
    let targetGoalId: GoalId = slot.suggestedGoalId || 'placement';
    if (slot.designatedCategory === 'DEVELOPMENT_SKILL') {
      targetGoalId = activeMainRoadmap.goalId;
    } else if (slot.designatedCategory === 'REVISION_PLANNING') {
      // Find any topic across active tracks that is due for spaced repetition or marked NEEDS_REVISION
      const dueRecord = Object.values(masteryMap).find(
        (m) => m.status === 'NEEDS_REVISION' || (m.nextReviewDate && m.nextReviewDate <= availability.date)
      );
      if (dueRecord) {
        targetGoalId = dueRecord.goalId;
      }
    }

    const roadmap = roadmaps.find((r) => r.goalId === targetGoalId) || roadmaps[0];

    // Priority 1: Weak topic / Spaced repetition due in this goal (only for already-started topics)
    let chosenTopic: RoadmapTopic | undefined = roadmap.topics.find((t) => {
      const m = masteryMap[t.id];
      return (
        m &&
        m.status !== 'NOT_STARTED' &&
        (m.status === 'NEEDS_REVISION' || (m.nextReviewDate <= availability.date && m.status !== 'MASTERED'))
      );
    });

    let sessionType: ScheduledLearningRecommendation['sessionType'] = 'NEW_CONCEPT';
    let reason = '';

    if (chosenTopic) {
      const m = masteryMap[chosenTopic.id];
      sessionType = m?.status === 'NEEDS_REVISION' ? 'WEAK_AREA_RECOVERY' : 'REVISION_SPACED';
      reason =
        m?.status === 'NEEDS_REVISION'
          ? `Autonomous weak-topic intervention: ${chosenTopic.title} has ${m.understandingLevel}% understanding (${m.mistakeCategories.join(', ') || 'recent quiz errors'}).`
          : `Spaced repetition due (${availability.date}): Reinforcing ${chosenTopic.title} before retention decays below ${m?.retentionScore ?? 75}%.`;
    } else {
      // Priority 2: Layer 3 Skill Gap recommendation for this goal (only if prerequisites are satisfied)
      const gap = skillGaps.find((g) => g.targetGoalId === targetGoalId && g.recommendedTopicId);
      if (gap && gap.recommendedTopicId) {
        const candidate = roadmap.topics.find((t) => t.id === gap.recommendedTopicId);
        if (candidate && arePrerequisitesMet(candidate, masteryMap)) {
          chosenTopic = candidate;
          sessionType =
            masteryMap[candidate.id]?.status === 'NOT_STARTED' ? 'NEW_CONCEPT' : 'WEAK_AREA_RECOVERY';
          reason = `From-Scratch Foundation Priority: ${gap.gapArea} (${gap.evidenceBasis}).`;
        }
      }
    }

    // Priority 3: Next unmastered topic whose prerequisites are satisfied (starts at Stage 1 Beginner Foundation)
    if (!chosenTopic) {
      chosenTopic = roadmap.topics.find((t) => {
        const m = masteryMap[t.id];
        const isMastered = m?.status === 'MASTERED' && m.nextReviewDate > availability.date;
        return !isMastered && arePrerequisitesMet(t, masteryMap);
      });
      if (chosenTopic) {
        sessionType = 'NEW_CONCEPT';
        reason =
          targetGoalId === activeMainRoadmap.goalId
            ? `One-Main-Skill-at-a-Time (From Scratch — Stage 1): Starting active ${activeMainRoadmap.shortTitle} foundation (${chosenTopic.title}) while Cybersecurity & AI/ML remain queued.`
            : `Complete Beginner Progression (From Scratch): Starting ${chosenTopic.stageTitle} — ${chosenTopic.title}.`;
      }
    }

    // Priority 4: Continuous learning / retention check if all initial topics are mastered
    if (!chosenTopic) {
      chosenTopic = roadmap.topics[0];
      sessionType = 'REVISION_SPACED';
      reason = `Initial ${roadmap.shortTitle} topics mastered — running retention & continuous specialization progression (${roadmap.continuousSpecializations[0]}).`;
    }

    recommendations.push({
      sessionId: `rec-${availability.date}-${slot.slotId}`,
      date: availability.date,
      slotId: slot.slotId,
      displayTime: slot.displayTime,
      durationMinutes: slot.durationMinutes,
      goalId: roadmap.goalId,
      topicId: chosenTopic.id,
      topicTitle: chosenTopic.title,
      sessionType,
      autonomousReason: reason,
      status: 'SCHEDULED',
    });
  }

  return recommendations;
}

/**
 * EVIDENCE-BASED MASTERY & SPACED REPETITION ENGINE (SM-2):
 * Never marks a topic MASTERED merely because the user clicked Complete or spent time.
 * Requires verified assessment accuracy >= 80% AND completed practical exercise.
 */
export function evaluateAssessmentAndMastery(
  currentRecord: TopicMasteryRecord | undefined,
  topicId: string,
  goalId: GoalId,
  quizCorrect: number,
  quizTotal: number,
  newMistakeCategories: string[],
  practicalCompleted: boolean,
  evaluationDate: string
): TopicMasteryRecord {
  const prev: TopicMasteryRecord = currentRecord || {
    topicId,
    goalId,
    startedAt: evaluationDate,
    status: 'IN_PROGRESS',
    assessmentAttempts: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    mistakeCategories: [],
    understandingLevel: 0,
    retentionScore: 0,
    practicalPerformance: 0,
    practicalCompleted: false,
    intervalDays: 1,
    easeFactor: 2.5,
    nextReviewDate: evaluationDate,
  };

  const scorePercent = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;
  const attempts = prev.assessmentAttempts + 1;
  const totalCorrect = prev.correctAnswers + quizCorrect;
  const totalIncorrect = prev.incorrectAnswers + Math.max(0, quizTotal - quizCorrect);
  const combinedPractical = prev.practicalCompleted || practicalCompleted;
  const practicalScore = combinedPractical ? Math.max(prev.practicalPerformance, 85) : Math.min(prev.practicalPerformance, 50);

  // Weighted understanding: 70% latest quiz accuracy + 30% practical completion evidence
  const understandingLevel = Math.round(scorePercent * 0.7 + practicalScore * 0.3);

  // SM-2 Spaced Repetition calculation
  // Quality grade q in 0..5 derived from scorePercent
  const quality = Math.round((scorePercent / 100) * 5);
  let intervalDays = prev.intervalDays;
  let easeFactor = prev.easeFactor;

  if (quality < 3) {
    intervalDays = 1;
    easeFactor = Math.max(1.3, Number((easeFactor - 0.2).toFixed(2)));
  } else {
    if (attempts === 1) {
      intervalDays = 2;
    } else if (attempts === 2) {
      intervalDays = 5;
    } else {
      intervalDays = Math.round(prev.intervalDays * easeFactor);
    }
    easeFactor = Math.max(
      1.3,
      Number((easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))).toFixed(2))
    );
  }

  const nextDateObj = new Date(`${evaluationDate}T00:00:00Z`);
  nextDateObj.setUTCDate(nextDateObj.getUTCDate() + intervalDays);
  const nextReviewDate = nextDateObj.toISOString().slice(0, 10);

  // Strict Mastery Gate: Requires scorePercent >= 80 AND combinedPractical === true
  let status: MasteryStatus = 'IN_PROGRESS';
  if (scorePercent >= 80 && combinedPractical && understandingLevel >= 80) {
    status = 'MASTERED';
  } else if (scorePercent < 65) {
    status = 'NEEDS_REVISION';
  } else {
    status = 'IN_PROGRESS';
  }

  const updatedMistakes =
    scorePercent >= 80
      ? prev.mistakeCategories.filter((c) => !newMistakeCategories.includes(c))
      : Array.from(new Set([...prev.mistakeCategories, ...newMistakeCategories]));

  return {
    ...prev,
    startedAt: prev.startedAt || evaluationDate,
    completedAt: status === 'MASTERED' ? evaluationDate : prev.completedAt,
    status,
    assessmentAttempts: attempts,
    correctAnswers: totalCorrect,
    incorrectAnswers: totalIncorrect,
    mistakeCategories: updatedMistakes,
    understandingLevel,
    retentionScore: Math.min(100, Math.round(scorePercent * 0.85 + 15)),
    practicalPerformance: practicalScore,
    practicalCompleted: combinedPractical,
    intervalDays,
    easeFactor,
    nextReviewDate,
    lastStudiedDate: evaluationDate,
  };
}

/**
 * CONTINUOUS LEARNING ENGINE:
 * Ensures there is never an artificial endpoint when initial topics in a roadmap are mastered.
 * Automatically appends advanced specialization topics when all initial topics reach MASTERED.
 */
export function checkAndUnlockContinuousLearning(
  roadmap: LearningRoadmap,
  masteryMap: Record<string, TopicMasteryRecord>
): { updatedRoadmap: LearningRoadmap; unlockedNewSpecialization: boolean; specializationTitle?: string } {
  const allMastered = roadmap.topics.every((t) => masteryMap[t.id]?.status === 'MASTERED');
  if (!allMastered || roadmap.continuousSpecializations.length === 0) {
    return { updatedRoadmap: roadmap, unlockedNewSpecialization: false };
  }

  const existingAdvCount = roadmap.topics.filter((t) => t.isAdvancedContinuousTopic).length;
  if (existingAdvCount >= roadmap.continuousSpecializations.length) {
    return { updatedRoadmap: roadmap, unlockedNewSpecialization: false };
  }

  const nextSpecTitle = roadmap.continuousSpecializations[existingAdvCount];
  const newTopicId = `${roadmap.goalId}-adv-${existingAdvCount + 1}`;
  const lastTopicId = roadmap.topics[roadmap.topics.length - 1]?.id;

  const newTopic: RoadmapTopic = {
    id: newTopicId,
    goalId: roadmap.goalId,
    stageId: 'stage-continuous-mastery',
    stageTitle: 'Continuous Mastery & Advanced Specialization',
    title: nextSpecTitle,
    subtopics: ['Architecture Trade-offs', 'Production Edge Cases', 'Benchmarking & Verification'],
    prerequisites: lastTopicId ? [lastTopicId] : [],
    estimatedDurationMinutes: 45,
    objectives: [
      `Master advanced concepts in ${nextSpecTitle} beyond the initial syllabus baseline`,
      'Apply production-grade verification and complexity trade-offs',
    ],
    masteryCriteria: 'Score >= 80% on specialization synthesis assessment and complete practical benchmark.',
    sourceType: 'AI_GENERATED',
    isAdvancedContinuousTopic: true,
    lesson: {
      conceptIntroduction: `Continuous Learning Specialization unlocked after mastering initial ${roadmap.shortTitle} topics: ${nextSpecTitle}.`,
      simpleExplanation: 'Rather than stopping at baseline completion, this module challenges your system-level intuition on edge cases, scalability bottlenecks, and failure recovery.',
      realWorldAnalogy: 'Moving from passing your driver’s license test to mastering defensive highway handling in heavy rain.',
      workedExample: `Applied case study in ${nextSpecTitle}: identifying tail-latency p99 bottlenecks and designing idempotent retry boundaries.`,
      stepByStepDemonstration: [
        '1. Measure baseline throughput and latency distribution (p50, p95, p99).',
        '2. Isolate contention locks or redundant network round-trips.',
        '3. Verify correctness under concurrent fault injection.',
      ],
      guidedExercise: {
        question: `What is the primary engineering risk when scaling ${nextSpecTitle} without bounded queues or backpressure?`,
        steps: ['Unbounded queues consume heap memory under load spikes', 'Leads to Out-Of-Memory (OOM) cascading failures'],
        expectedAnswer: 'Unbounded memory growth and cascading tail-latency timeouts under traffic spikes.',
      },
      independentExercise: {
        prompt: `Write a 3-point architecture decision record (ADR) for implementing ${nextSpecTitle} in your portfolio project.`,
        evaluationRubric: ['States context & bottleneck', 'Evaluates 2 alternatives', 'Defines measurable success metric'],
      },
      quizQuestions: [
        {
          id: `q-${newTopicId}-1`,
          question: `In ${nextSpecTitle}, why do production systems monitor p99 latency rather than only average (mean) latency?`,
          options: [
            'Average latency hides severe tail stalls experienced by the slowest 1% of requests that trigger cascading retries',
            'Mean latency requires floating-point division',
            'p99 latency is always lower than p50 latency',
            'Browsers reject responses faster than 10ms',
          ],
          correctIndex: 0,
          explanation: 'High tail latency (p99) causes client timeouts and retry storms even when average latency looks healthy.',
          mistakeCategory: 'Systems Scalability & Tail Latency',
        },
      ],
      revisionRecommendation: 'Integrate this specialization directly into an Advanced Portfolio Project.',
    },
  };

  return {
    updatedRoadmap: {
      ...roadmap,
      topics: [...roadmap.topics, newTopic],
    },
    unlockedNewSpecialization: true,
    specializationTitle: nextSpecTitle,
  };
}

/**
 * MISSED SESSION RECOVERY ENGINE:
 * Records missed sessions honestly, determines importance, checks remaining availability,
 * and decides whether to reschedule, shorten, postpone, or adapt teaching prerequisites
 * WITHOUT shifting every subsequent session or sacrificing sleep, meals, exercise, or college.
 */
export function planMissedSessionRecovery(
  missedSession: ScheduledLearningRecommendation,
  masteryRecord: TopicMasteryRecord | undefined,
  currentMode: 'WORKING_DAY' | 'HOLIDAY' | 'EXAM_MODE',
  remainingReviewBufferMinutes: number = 15
): MissedSessionRecoveryDecision {
  const isRepeatedDifficulty =
    Boolean(masteryRecord) &&
    (masteryRecord!.incorrectAnswers >= 2 || masteryRecord!.status === 'NEEDS_REVISION');

  const importanceLevel: MissedSessionRecoveryDecision['importanceLevel'] =
    missedSession.goalId === 'placement' || missedSession.goalId === 'dsa_cp'
      ? 'CRITICAL'
      : missedSession.goalId === 'gate_cse' || missedSession.goalId === 'fullstack'
      ? 'HIGH'
      : 'MODERATE';

  // Case 1: Repeated struggle on this topic -> adapt teaching approach & prerequisites instead of blind rescheduling
  if (isRepeatedDifficulty) {
    return {
      missedSessionId: missedSession.sessionId,
      missedTopicId: missedSession.topicId,
      missedTopicTitle: missedSession.topicTitle,
      goalId: missedSession.goalId,
      importanceLevel,
      action: 'ADAPT_TEACHING_PREREQUISITE',
      targetDate: missedSession.date,
      targetSlotDisplay: 'Next Designated Subject Slot (Prerequisite Breakdown)',
      recommendedDurationMinutes: 25,
      explanation: `Detected repeated difficulty on "${missedSession.topicTitle}" (${masteryRecord?.mistakeCategories.join(', ') || 'multiple quiz errors'}). Instead of piling on backlog, the AI Tutor has switched this topic to a simplified prerequisite step-by-step walkthrough in the next designated slot while keeping tonight's 10:00 PM sleep boundary intact.`,
      isRepeatedDifficulty: true,
      protectedCommitmentsVerified: true,
    };
  }

  // Case 2: High/Critical priority and today still has the 15m/10m review buffer available -> Shortened high-yield micro-session
  if (remainingReviewBufferMinutes >= 10 && (importanceLevel === 'CRITICAL' || importanceLevel === 'HIGH')) {
    return {
      missedSessionId: missedSession.sessionId,
      missedTopicId: missedSession.topicId,
      missedTopicTitle: missedSession.topicTitle,
      goalId: missedSession.goalId,
      importanceLevel,
      action: 'SHORTEN_HIGH_YIELD',
      targetDate: missedSession.date,
      targetSlotDisplay: currentMode === 'WORKING_DAY' ? '9:40–9:50 PM (Review & Plan Buffer)' : '8:00–8:30 PM (Weekly Revision Slot)',
      recommendedDurationMinutes: currentMode === 'WORKING_DAY' ? 15 : 25,
      explanation: `Recorded "${missedSession.topicTitle}" as missed. Because ${missedSession.goalId.toUpperCase()} is ${importanceLevel.toLowerCase()} priority, compressed the core concept + 2 key quiz questions into a ${currentMode === 'WORKING_DAY' ? '15-minute' : '25-minute'} high-yield micro-session without shifting dinner, college academics, or your 10:00 PM sleep time.`,
      isRepeatedDifficulty: false,
      protectedCommitmentsVerified: true,
    };
  }

  // Case 3: Moderate priority or no buffer left today -> Postpone cleanly to tomorrow's matching slot without cascading backlog
  const nextDateObj = new Date(`${missedSession.date}T00:00:00Z`);
  nextDateObj.setUTCDate(nextDateObj.getUTCDate() + 1);
  const tomorrowDate = nextDateObj.toISOString().slice(0, 10);

  return {
    missedSessionId: missedSession.sessionId,
    missedTopicId: missedSession.topicId,
    missedTopicTitle: missedSession.topicTitle,
    goalId: missedSession.goalId,
    importanceLevel,
    action: 'POSTPONE_NEXT_SIMILAR_SLOT',
    targetDate: tomorrowDate,
    targetSlotDisplay: `${tomorrowDate} (${missedSession.displayTime})`,
    recommendedDurationMinutes: missedSession.durationMinutes,
    explanation: `Recorded "${missedSession.topicTitle}" as missed. To protect your sleep, dinner, and remaining evening sessions from cascading delays, cleanly moved this topic to tomorrow's designated ${missedSession.displayTime} slot.`,
    isRepeatedDifficulty: false,
    protectedCommitmentsVerified: true,
  };
}
