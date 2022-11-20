const R = require("ramda");

/*
  Used to prepare permission list for processing
  Accept: 
  [
    {
      role: "admin",
      resource: "user",
      action: "update",
      fields: ["name", "email", "password"],
      condition: (actor, subject) => {
        return actor.id == subject.id;
      },
    },
    ...
  ]
*/
function load(data) {
  return R.reduce(
    (
      acc,
      { role, resource, action, fields = [], condition = R.always(true) }
    ) => {
      const actions = R.path([role, resource, action], acc);
      const newAction = { fields, condition };
      return R.assocPath(
        [role, resource, action],
        R.append(newAction, actions),
        acc
      );
    },
    {},
    data
  );
}

function check(policies, { role, actor = {}, resource, subject = {}, action }) {
  const rules = R.path([role, resource, action], policies);
  const policy = R.find(
    (policy) => policy?.condition(actor, subject) || false,
    rules
  );
  return {
    isAllowed: policy !== undefined,
    fields: policy?.fields || [],
  };
}

function getActions(policies, { role, actor, resource, subject }) {
  const actions = R.path([role, resource], policies);
  return R.reduce(
    (acc, [action, rules]) => {
      const applicable = R.filter(
        (rule) => rule?.condition(actor, subject) || false,
        rules
      );
      if (applicable.length > 0) {
        return [...acc, action];
      } else {
        return acc;
      }
    },
    [],
    R.toPairs(actions)
  );
}

function isAllowed(policies, { role, actor, resource, subject, action }) {
  const actions = getActions(policies, { role, actor, resource, subject });
  return actions.includes(action);
}

module.exports = { check, load, getActions, isAllowed };
