const toKebabCase = (str) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Tên module (ví dụ: user, post):',
  },
  {
    type: 'multiselect',
    name: 'presentations',
    message: 'Muốn generate loại presentation?',
    choices: [
      {
        title: 'GraphQL',
        value: 'graphql',
        selected: true,
      },
      {
        title: 'RestfulApi',
        value: 'rest',
        selected: true,
      },
    ],
  },
  {
    type: 'input',
    name: 'computed',
    message: '',
    initial: '',
    skip: true,
    result: (_, answers) => {
      const name = answers.name;
      const Name = name.charAt(0).toUpperCase() + name.slice(1);
      const kebab = toKebabCase(name);
      const camelCase = name.charAt(0).toLowerCase() + name.slice(1);
      return { Name, kebab, camelCase };
    },
  },
];
