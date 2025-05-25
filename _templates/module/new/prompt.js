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
];
