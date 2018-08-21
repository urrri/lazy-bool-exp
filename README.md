# lazy-bool-exp
Lazy Boolean expressions

## Installation

```bash
npm install lazy-bool-exp --save
```
or
```bash
yarn add lazy-bool-exp 
```


## Usage examples

```js
import {exp} from 'lazy-bool-exp';

// build expressions

const calc1 = exp.val('read').and( exp.val('update').or.val('delete') ).calc;
const calc2 = exp.val('read').and.val('update').or.val('delete').calc;

// calculate expressions with data

const data = {
  read: false,
  update: false,
  delete: true
};

console.log(
  calc1(data), // -> false
  calc2(data)  // -> true
);
```

##Expression customizing:

```js
import {customExp} from 'lazy-bool-exp';

// Create customized expression

const map = customExp({
  customFields: ['create', 'read', 'update', 'delete'], // allows use .read() instead of .val('read'), etc.
  converters: {
    toStyle: calc => (input, style) => ({[style || 'visible']: calc(input)})
  }
});

// build expressions

const toStyle1 = map.read().and( map.update().or.delete() ).toStyle;
const toStyle2 = map.read().and.update().or.delete().toStyle;

const calc3 = map.not( map.update().or.delete() ).calc;

// calculate expressions with data

const data = {
  read: false,
  update: false,
  delete: true
};

console.log(
  toStyle1(data, 'enabled'), // -> {enabled: false}
  toStyle2(data),            // -> {visible: true}
  
  calc3(data),               // -> false
  calc3({}),                 // -> true
);
```
