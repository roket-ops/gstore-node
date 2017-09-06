function wrap(schema, params, hooks = []) {
  const { options = {}, target = params } = params;
  const proto = target.prototype;
  const parent = Object.getPrototypeOf(target);
  const staticProps = Object.getOwnPropertyNames(target);
  const prototypeProps = Object.getOwnPropertyNames(proto);
  const instanceProps = prototypeProps.filter(name => name !== 'constructor');

  if (parent.name) wrap(schema, parent, hooks);
  if (target.schema && typeof target.schema === 'object') {
    schema.add(target.schema);
  }

  if (target.hooks && typeof target.hooks === 'object') {
    Object.keys(target.hooks).forEach(hookType => {
      Object.keys(target.hooks[hookType]).forEach(hookAction => {
        const hook = target.hooks[hookType][hookAction];
        const index = hooks.indexOf(hook);
        if (index < 0) {
          hooks.push(hook);
          schema[hookType](hookAction, hook);
        }
      });
    });
  }
  staticProps.forEach(name => {
    const method = Object.getOwnPropertyDescriptor(target, name);
    if (typeof method.value === 'function') schema.static(name, method.value);
  });
  instanceProps.forEach(name => {
    const method = Object.getOwnPropertyDescriptor(proto, name);
    if (typeof method.value === 'function') schema.method(name, method.value);
    if (!options.ignoreGettersAndSetters) {
      if (typeof method.get === 'function') schema.virtual(name).get(method.get);
      if (typeof method.set === 'function') schema.virtual(name).set(method.set);
    }
  });

  return schema;
}

module.exports = wrap;
