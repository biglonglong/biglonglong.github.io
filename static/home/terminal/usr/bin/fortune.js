const quotes = [
    "There are only 10 types of people in this world: those who understand binary and those who don't.",
    'Always code as if the person maintaining your code knows where you live.',
    'If debugging removes software bugs, programming must put them in.',
    'The best thing about a boolean is that even if you are wrong, you are only off by a bit.',
    'A good programmer looks both ways before crossing a one-way street.',
    'The most important tool for a programmer is a rubber duck.',
];

export function run() {
    return quotes[Math.floor(Math.random() * quotes.length)] + '\n';
}
