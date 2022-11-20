const R = require("ramda");
const cerberus = require("./index");

const policies = [
  {
    role: "admin",
    resource: "user",
    action: "create",
  },
  {
    role: "admin",
    resource: "user",
    action: "delete",
    condition: (actor, subject) => {
      return actor.id !== subject.id;
    },
  },
  {
    role: "admin",
    resource: "user",
    action: "read",
  },
  {
    role: "admin",
    resource: "user",
    action: "update",
    fields: ["name", "email", "password"],
    condition: (actor, subject) => {
      return actor.id == subject.id;
    },
  },
  {
    role: "admin",
    resource: "user",
    action: "update",
    fields: ["name"],
    condition: (actor, subject) => {
      return actor.id !== subject.id;
    },
  },
];

const tests = [
  {
    is: "Admin can create user",
    request: {
      role: "admin",
      actor: { id: 1 },
      resource: "user",
      action: "create",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Actor is optional field",
    request: {
      role: "admin",
      resource: "user",
      action: "create",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Actor can be null",
    request: {
      role: "admin",
      actor: null,
      resource: "user",
      action: "create",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Actor can be undefined",
    request: {
      role: "admin",
      actor: undefined,
      resource: "user",
      action: "create",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Actor can be empty object",
    request: {
      role: "admin",
      actor: {},
      resource: "user",
      action: "create",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Subject is optional field",
    request: {
      role: "admin",
      resource: "user",
      action: "create",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Subject can be null",
    request: {
      role: "admin",
      subject: null,
      resource: "user",
      action: "create",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Subject can be undefined",
    request: {
      role: "admin",
      subject: undefined,
      resource: "user",
      action: "create",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Subject can be empty object",
    request: {
      role: "admin",
      subject: {},
      resource: "user",
      action: "create",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Admin can read any user",
    request: {
      role: "admin",
      actor: { id: 1 },
      resource: "user",
      action: "read",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
  {
    is: "Admin can update itself",
    request: {
      role: "admin",
      actor: { id: 1 },
      resource: "user",
      subject: { id: 1 },
      action: "update",
    },
    responce: {
      isAllowed: true,
      fields: ["name", "email", "password"],
    },
  },
  {
    is: "Admin can update only name of any user",
    request: {
      role: "admin",
      actor: { id: 1 },
      resource: "user",
      subject: { id: 2 },
      action: "update",
    },
    responce: {
      isAllowed: true,
      fields: ["name"],
    },
  },
  {
    is: "Admin can not delete itself",
    request: {
      role: "admin",
      actor: { id: 1 },
      resource: "user",
      subject: { id: 1 },
      action: "delete",
    },
    responce: {
      isAllowed: false,
      fields: [],
    },
  },
  {
    is: "Admin can delete any user",
    request: {
      role: "admin",
      actor: { id: 1 },
      resource: "user",
      subject: { id: 2 },
      action: "delete",
    },
    responce: {
      isAllowed: true,
      fields: [],
    },
  },
];

const permissions = cerberus.load(policies);

R.map(({ is, request, responce }) => {
  test(is, () => {
    const decision = cerberus.check(permissions, request);
    expect(decision).toEqual(responce);
  });
}, tests);


test("Admin can perform any action with basic user", () => {
  const actions = cerberus.getActions(permissions, {
    role: "admin",
    actor: { id: 1 },
    resource: "user",
    subject: { id: 2 },
  })
  expect(actions).toEqual(['create', 'delete', 'read', 'update'])
})

test("Admin should not have 'delete' action for itself ", () => {
  const actions = cerberus.getActions(permissions, {
    role: "admin",
    actor: { id: 1 },
    resource: "user",
    subject: { id: 1 },
  })
  expect(actions).toEqual(['create', 'read', 'update'])
})
