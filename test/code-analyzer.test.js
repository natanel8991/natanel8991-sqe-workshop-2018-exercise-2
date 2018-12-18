import assert from 'assert';
import {SubCode} from '../src/js/code-analyzer';

describe('Main Function SubCode',() => {
    it('an example code to substitute ', () => {
        assert.equal((SubCode('let g=5; function foo(x){return x;}', '1'))[0],'function foo(x) {\n' + 'return x;\n' + '}'
        );
    });
    it('function with more than one parameter', () => {
        assert.equal((SubCode('let g=5; function foo(x,y){return x;}', '1,2'))[0], 'function foo(x, y) {\n' + 'return x;\n' + '}'
        );
    });
    it('function with only let,assignment,return expressions', () => {
        assert.equal((SubCode('function foo(x){let a=5; x=a; a=a+1; return x;}', '1'))[0], 'function foo(x) {\n' + 'x = 5;\n' + 'return x;\n' + '}'
        );
    });
    it('function with while expression', () => {
        assert.equal((SubCode('function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' + 'while (a < z) {\n' +
            'c = a + b;\n' + 'z = c * 2;\n' + '}\n' + 'return z;\n' + '}\n', '1,2,5'))[0], 'function foo(x, y, z) {\n' + 'while(x + 1 < z){\n' +
            'z = x + 1 + x + 1 + y * 2;\n' + '}\n' + 'return z;\n' + '}'
        );
    });
});
describe('if tests',()=>{
    it('function with if expression', () => {
        assert.equal((SubCode('function foo(x){if(x<5){ return x;}}', '1'))[0], 'function foo(x) {\n' + 'if(x < 5){\n' + 'return x;\n' + '}\n' + '}'
        );});
    it('function with if and else expression', () => {
        assert.equal((SubCode('function foo(x){if(x<5){ return x;} else{return x+1; }}', '1'))[0], 'function foo(x) {\n' + 'if(x < 5){\n' + 'return x;\n' + '}\n' + 'else{\n' + 'return x + 1;\n' + '}\n' + '}'
        );});
    it('function with complex if and else  expression', () => {
        assert.equal((SubCode('function foo(x, y, z){\n' + 'let a = x + 1;\n' + 'let b = a + y;\n' + 'let c = 0;\n' + 'if (b < z) {\n' + 'c = c + 5;\n' + 'return x + y + z + c;\n' + '} else if (b < z * 2) {\n' +
            'c = c + x + 5;\n' + 'return x + y + z + c;\n' + '} else {\n' + 'c = c + z + 5;\n' + 'return x + y + z + c;\n' + '}\n' +
            '}\n', '1,2,4'))[0], 'function foo(x, y, z) {\n' + 'if(x + 1 + y < z){\n' + 'return x + y + z + 0 + 5;\n' + '}\n' + 'else{\n' + 'if(x + 1 + y < z * 2){\n' +
            'return x + y + z + 0 + x + 5;\n' + '}\n' + 'else{\n' + 'return x + y + z + 0 + z + 5;\n' + '}\n' + '}\n' + '}'
        );});
    it('function with let exp in ifExp and update parameter in elseExp (if happend)',() => {
        assert.equal((SubCode('function foo(x){\n' + 'let a = 5;\n' + 'if (x < a) {\n' + 'let d= x + 5;\n' + 'return d;\n' + '} \n' + 'else {\n' + 'x=x+1;\n' + 'return x;\n' +
            '}\n'+'}', '6'))[0], 'function foo(x) {\n' + 'if(x < 5){\n' + 'return x + 5;\n' + '}\n' + 'else{\n' + 'x = x + 1;\n' + 'return x;\n' + '}\n'+'}'
        );});
});

describe('function with different types of inputs',()=>{
    it('function with string inputs', () => {
        assert.equal((SubCode('function foo(x,y){if(x<y){ return x;}}', '"aa","ab"'))[0], 'function foo(x, y) {\n' + 'if(x < y){\n' + 'return x;\n' + '}\n' + '}'
        );});
    it('function with array input', () => {
        assert.equal((SubCode('function foo(x){if(x[1]<2){ return 0;}}', '[1,2,3]'))[1][0],'red'
        );});
    it('function with boolean input', () => {
        assert.equal((SubCode('function foo(x){if(x){ return 0;}}', 'true'))[1][0],'lightgreen'
        );});
});
