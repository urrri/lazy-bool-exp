const defaultOptions = {
  getInput: inputField => input => input[inputField]
  // customFields: ['field', 'names'],
  // converters: {
  //   conv: calc => input => ({res: calc(input)})
  // }
};

const ops = {
  false: {
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    none: (_, b) => b
  },
  true: {
    and: (a, b) => a && !b,
    or: (a, b) => a || !b,
    none: (_, b) => !b
  }
};

const noop = () => {};

const getCalc = (op, calcLeft, calcRight) => input => op(calcLeft(input), calcRight(input));

const buildConverters = (options, that) => {
  const {converters} = options;
  if (!converters) return {};
  return Object.keys(converters).reduce((acc, name) => {
    acc[name] = converters[name](that.calc);
    return acc;
  }, {});
};

const buildGroups = function(options, that) {
  return {
    ...buildConverters(options, that),
    and: buildGroup(options, that, false, 'and'),
    or: buildGroup(options, that, false, 'or'),
    calc: that.calc
  };
};

const buildGroup = function(options, that_, inv = false, op = 'none') {
  const group = otherCalc => {
    const that = that_ || {};
    otherCalc = otherCalc.calc || otherCalc;
    const lastCalc = that.calc || noop;
    that.calc = getCalc(ops[inv][op], lastCalc, otherCalc);

    return buildGroups(options, that);
  };

  options.customFields &&
  options.customFields.forEach(name => { group[name] = build(options, that_, inv, op, name); });

  group.val = build(options, that_, inv, op);
  if (!inv) group.not = buildGroup(options, that_, true, op);

  return group;
};

const build = function(options, that_, inv = false, op = 'none', predefinedField) {
  return inputField => {
    const that = that_ || {};
    const lastCalc = that.calc || noop;
    that.calc = getCalc(ops[inv][op], lastCalc, options.getInput(predefinedField || inputField));

    return buildGroups(options, that);
  };
};

export const exp = buildGroup(defaultOptions);

export const customExp = options => buildGroup({...defaultOptions, ...options});

/*
// USAGE:

const calc1 = exp.val('read').and( exp.val('update').or.val('delete') ).calc;
const calc2 = exp.val('read').and.val('update').or.val('delete').calc;

const data = {
  read: false,
  update: false,
  delete: true
};

console.log(
  calc1(data), // -> false
  calc2(data)  // -> true
);

// CUSTOM:

const map = customExp({
  customFields: ['create', 'read', 'update', 'delete'], // allows use .read() instead of .val('read'), etc.
  converters: {
    toStyle: calc => (input, style) => ({[style || 'visible']: calc(input)})
  }
});

const toStyle1 = map.read().and( map.update().or.delete() ).toStyle;
const toStyle2 = map.read().and.update().or.delete().toStyle;
const calc3 = map.not( map.update().or.delete() ).calc;

console.log(
  toStyle1(data, 'enabled'), // -> {enabled: false}
  toStyle2(data),            // -> {visible: true}
  calc3(data)                // -> false
);

*/



