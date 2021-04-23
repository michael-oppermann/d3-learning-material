
const hierarchicalData = {
  name: "root",
  children: [
    {name: "child #1"},
    {
      name: "child #2",
      children: [
        {name: "grandchild #1"},
        {name: "grandchild #2"},
        {name: "grandchild #3"}
      ]
    }
  ]
};

const tidyTree = new TidyTree({ parentElement: '#tidy-tree'}, hierarchicalData);