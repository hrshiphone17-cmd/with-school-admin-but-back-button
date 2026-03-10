export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  isCompleted: boolean;
  isLocked: boolean;
  type: "code" | "visual";
  instructions: string;
  starterCode: string;
  hints: string[];
  expectedOutput?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  icon: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  modules: Module[];
  totalExercises: number;
  completedExercises: number;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "Fox's First Steps",
    description: "Learn the basics of coding by helping our fox friend navigate through the jungle!",
    icon: "🦊",
    color: "banana",
    difficulty: "beginner",
    totalExercises: 8,
    completedExercises: 5,
    modules: [
      {
        id: "m1-1",
        title: "Hello World!",
        description: "Write your very first line of code",
        icon: "👋",
        exercises: [
          {
            id: "e1-1",
            title: "Say Hello!",
            description: "Print your first message to the screen",
            difficulty: "easy",
            xpReward: 50,
            isCompleted: true,
            isLocked: false,
            type: "code",
            instructions: "Use the `print()` function to display 'Hello, World!' on the screen.\n\nThis is your first step into coding! The `print()` function shows text on the console.",
            starterCode: '// Type your code here\nprint("Hello, World!")',
            hints: ["Use print() with text inside quotes", "Don't forget the parentheses!"],
            expectedOutput: "Hello, World!",
          },
          {
            id: "e1-2",
            title: "What's Your Name?",
            description: "Learn about variables by introducing yourself",
            difficulty: "easy",
            xpReward: 75,
            isCompleted: true,
            isLocked: false,
            type: "code",
            instructions: "Create a variable called `name` and set it to your name. Then print it!",
            starterCode: '// Create a variable\nlet name = ""\nprint(name)',
            hints: ["Put your name between the quotes", "Variables store information for later"],
          },
        ],
      },
      {
        id: "m1-2",
        title: "Moving Around",
        description: "Help the fox move through the grid",
        icon: "🏃",
        exercises: [
          {
            id: "e1-3",
            title: "First Steps",
            description: "Move the fox forward",
            difficulty: "easy",
            xpReward: 100,
            isCompleted: true,
            isLocked: false,
            type: "visual",
            instructions: "Use `moveForward()` to move the fox 3 steps to reach the banana!\n\nThe fox starts facing right. Each `moveForward()` call moves it one square.",
            starterCode: "// Move the fox to the banana!\nmoveForward()\nmoveForward()\nmoveForward()",
            hints: ["You need 3 moveForward() calls", "The fox moves one square per call"],
          },
          {
            id: "e1-4",
            title: "Turn and Collect",
            description: "Learn to turn and collect bananas",
            difficulty: "easy",
            xpReward: 100,
            isCompleted: true,
            isLocked: false,
            type: "visual",
            instructions: "Use `moveForward()`, `turnLeft()`, and `collectItem()` to navigate and grab the banana!",
            starterCode: "moveForward()\nturnLeft()\nmoveForward()\ncollectItem()",
            hints: ["Turn left, then move forward", "Use collectItem() when on the banana"],
          },
        ],
      },
      {
        id: "m1-3",
        title: "Loops & Patterns",
        description: "Repeat actions using loops",
        icon: "🔄",
        exercises: [
          {
            id: "e1-5",
            title: "Repeat After Me",
            description: "Use a loop to move the fox",
            difficulty: "medium",
            xpReward: 150,
            isCompleted: true,
            isLocked: false,
            type: "visual",
            instructions: "Use a `for` loop to move the fox 5 steps forward instead of writing moveForward() five times.",
            starterCode: "for (let i = 0; i < 5; i++) {\n  moveForward()\n}",
            hints: ["A for loop repeats code a certain number of times", "Change the number 5 to control how many times it loops"],
          },
          {
            id: "e1-6",
            title: "Square Dance",
            description: "Make the fox walk in a square",
            difficulty: "medium",
            xpReward: 150,
            isCompleted: false,
            isLocked: false,
            type: "visual",
            instructions: "Use a loop to make the fox walk in a square pattern. It needs to move forward and turn right 4 times.",
            starterCode: "// Make a square!\nfor (let i = 0; i < 4; i++) {\n  moveForward()\n  moveForward()\n  turnRight()\n}",
            hints: ["A square has 4 sides", "Move forward twice, then turn right", "Repeat 4 times!"],
          },
          {
            id: "e1-7",
            title: "Banana Trail",
            description: "Collect all bananas in a line",
            difficulty: "medium",
            xpReward: 200,
            isCompleted: false,
            isLocked: false,
            type: "visual",
            instructions: "There are 4 bananas in a line. Move forward and collect each one!",
            starterCode: "for (let i = 0; i < 4; i++) {\n  moveForward()\n  collectItem()\n}",
            hints: ["Move then collect, repeat for each banana"],
          },
          {
            id: "e1-8",
            title: "Maze Runner",
            description: "Navigate through a simple maze",
            difficulty: "hard",
            xpReward: 300,
            isCompleted: false,
            isLocked: true,
            type: "visual",
            instructions: "Navigate the fox through the maze to reach the goal flag!",
            starterCode: "// Navigate the maze!\nmoveForward()\nturnRight()\nmoveForward()\nmoveForward()\nturnLeft()\nmoveForward()",
            hints: ["Plan your path first", "Watch out for walls!"],
          },
        ],
      },
    ],
  },
  {
    id: "course-2",
    title: "Jungle Variables",
    description: "Discover how to store and use information with variables and data types!",
    icon: "🌴",
    color: "mint",
    difficulty: "beginner",
    totalExercises: 6,
    completedExercises: 2,
    modules: [
      {
        id: "m2-1",
        title: "Storing Treasures",
        description: "Learn to save values in variables",
        icon: "💎",
        exercises: [
          { id: "e2-1", title: "My First Variable", description: "Create and use a variable", difficulty: "easy", xpReward: 50, isCompleted: true, isLocked: false, type: "code", instructions: "Create a variable called `bananas` and set it to 5.", starterCode: "let bananas = \nprint(bananas)", hints: ["Use let to create a variable", "Set it equal to 5"], expectedOutput: "5" },
          { id: "e2-2", title: "Banana Math", description: "Do math with variables", difficulty: "easy", xpReward: 75, isCompleted: true, isLocked: false, type: "code", instructions: "Add bananas together and print the total.", starterCode: "let bag1 = 3\nlet bag2 = 7\nlet total = bag1 + bag2\nprint(total)", hints: ["Use + to add numbers"], expectedOutput: "10" },
        ],
      },
      {
        id: "m2-2",
        title: "Types of Data",
        description: "Numbers, text, and more!",
        icon: "📊",
        exercises: [
          { id: "e2-3", title: "Numbers & Text", description: "Learn the difference", difficulty: "easy", xpReward: 75, isCompleted: false, isLocked: false, type: "code", instructions: "Create a number variable and a text variable.", starterCode: 'let age = 10\nlet name = "Fox"\nprint(name + " is " + age)', hints: ["Numbers don't need quotes, text does"], expectedOutput: "Fox is 10" },
          { id: "e2-4", title: "True or False", description: "Boolean values", difficulty: "medium", xpReward: 100, isCompleted: false, isLocked: false, type: "code", instructions: "Learn about true/false values.", starterCode: "let isFun = true\nlet isBoring = false\nprint(isFun)", hints: ["Booleans are either true or false"], expectedOutput: "true" },
          { id: "e2-5", title: "Lists of Things", description: "Store multiple items", difficulty: "medium", xpReward: 125, isCompleted: false, isLocked: true, type: "code", instructions: "Create an array of fruits.", starterCode: 'let fruits = ["banana", "apple", "mango"]\nprint(fruits[0])', hints: ["Arrays use square brackets", "Index starts at 0"], expectedOutput: "banana" },
          { id: "e2-6", title: "Variable Challenge", description: "Put it all together", difficulty: "hard", xpReward: 200, isCompleted: false, isLocked: true, type: "code", instructions: "Combine everything you learned!", starterCode: "// Your challenge code here", hints: ["Use variables, math, and print"] },
        ],
      },
    ],
  },
  {
    id: "course-3",
    title: "Condition Kingdom",
    description: "Make decisions in your code with if/else statements!",
    icon: "🏰",
    color: "peach",
    difficulty: "intermediate",
    totalExercises: 5,
    completedExercises: 0,
    modules: [
      {
        id: "m3-1",
        title: "If This Then That",
        description: "Make your first decision",
        icon: "🤔",
        exercises: [
          { id: "e3-1", title: "Is it Raining?", description: "Your first if statement", difficulty: "easy", xpReward: 75, isCompleted: false, isLocked: false, type: "code", instructions: "Use an if statement to check the weather.", starterCode: 'let raining = true\nif (raining) {\n  print("Bring umbrella!")\n}', hints: ["if checks a condition", "Code inside {} runs when true"], expectedOutput: "Bring umbrella!" },
          { id: "e3-2", title: "Choose Your Path", description: "If/else decisions", difficulty: "medium", xpReward: 100, isCompleted: false, isLocked: false, type: "code", instructions: "Use if/else to choose between two options.", starterCode: 'let age = 10\nif (age >= 13) {\n  print("Teenager!")\n} else {\n  print("Kid!")\n}', hints: ["else runs when the if condition is false"], expectedOutput: "Kid!" },
          { id: "e3-3", title: "Multiple Choices", description: "If/else if/else chains", difficulty: "medium", xpReward: 125, isCompleted: false, isLocked: true, type: "code", instructions: "Check multiple conditions.", starterCode: "let score = 85\n// Add if/else if/else", hints: ["Use else if for additional conditions"] },
          { id: "e3-4", title: "Gate Keeper", description: "Use conditions in the game", difficulty: "medium", xpReward: 150, isCompleted: false, isLocked: true, type: "visual", instructions: "The fox needs to check for keys before opening doors!", starterCode: "// Check for key\nif (hasKey()) {\n  openDoor()\n  moveForward()\n}", hints: ["Use hasKey() to check", "Open door before moving through"] },
          { id: "e3-5", title: "Logic Master", description: "Combine conditions", difficulty: "hard", xpReward: 250, isCompleted: false, isLocked: true, type: "code", instructions: "Use AND (&&) and OR (||) operators.", starterCode: "let hasSword = true\nlet hasShield = false\n// Combine conditions", hints: ["&& means both must be true", "|| means at least one must be true"] },
        ],
      },
    ],
  },
  {
    id: "course-4",
    title: "Function Forest",
    description: "Build reusable code blocks with functions!",
    icon: "🌳",
    color: "pastel-blue",
    difficulty: "intermediate",
    totalExercises: 4,
    completedExercises: 0,
    modules: [
      {
        id: "m4-1",
        title: "Building Blocks",
        description: "Create your first functions",
        icon: "🧱",
        exercises: [
          { id: "e4-1", title: "My First Function", description: "Create a reusable block", difficulty: "medium", xpReward: 100, isCompleted: false, isLocked: false, type: "code", instructions: "Create a function that says hello.", starterCode: 'function sayHello() {\n  print("Hello!")\n}\nsayHello()', hints: ["Functions group code together", "Call a function with ()"], expectedOutput: "Hello!" },
          { id: "e4-2", title: "Parameters", description: "Pass information to functions", difficulty: "medium", xpReward: 125, isCompleted: false, isLocked: false, type: "code", instructions: "Create a function that takes a name parameter.", starterCode: 'function greet(name) {\n  print("Hello, " + name + "!")\n}\ngreet("Fox")', hints: ["Parameters go inside the parentheses"], expectedOutput: "Hello, Fox!" },
          { id: "e4-3", title: "Return Values", description: "Get results from functions", difficulty: "hard", xpReward: 175, isCompleted: false, isLocked: true, type: "code", instructions: "Create a function that returns a calculated value.", starterCode: "function add(a, b) {\n  return a + b\n}\nlet result = add(3, 5)\nprint(result)", hints: ["return sends a value back"], expectedOutput: "8" },
          { id: "e4-4", title: "Function Dance", description: "Combine functions with the game", difficulty: "hard", xpReward: 250, isCompleted: false, isLocked: true, type: "visual", instructions: "Create functions to make the fox dance patterns!", starterCode: "function dance() {\n  turnLeft()\n  turnRight()\n  turnLeft()\n  turnRight()\n}\ndance()", hints: ["Define the function first, then call it"] },
        ],
      },
    ],
  },
];
