import * as esprima from 'esprima';
import * as escodegen from 'escodegen';




let FunctionMap=new Map();
FunctionMap.set('VariableDeclaration',LetHandler);
FunctionMap.set('ExpressionStatement',AssignmentExpHandler);
FunctionMap.set('IfStatement',IfHandler);
FunctionMap.set('WhileStatement',WhileHandler);
FunctionMap.set('ReturnStatement',ReturnHandler);


let GlobalVariables =new Map();
let FunctionParams =new Map();
let LocalVariables=new Map();
let TmpLocalVariables=null;

let SubbedCode = [];
let PaintList = [];





export function SubCode(CodeToSub,InputVector){
    GlobalVariables=new Map();
    FunctionParams=new Map();
    LocalVariables=new Map();
    TmpLocalVariables=null;
    SubbedCode=[]; PaintList=[];

    let FunctionCode=ExtractGlobalVariables(CodeToSub);//extract GV and their values to list
    SubbedCode.push((escodegen.generate(FunctionCode)).split('{')[0]+'{');
    ExtractFunctionParams(FunctionCode,InputVector);//extract Params and their Values to List
    BodyHandler(FunctionCode['body'],false);

    let result='';
    for(let i=0;i<SubbedCode.length;i++){
        result=result + SubbedCode[i]+ '\n';
    }
    result=result+'}';
    EvalAndPaint((esprima.parseScript(result)['body'][0]['body']['body']));
    return [result,PaintList];
}


function ExtractGlobalVariables(CodetoSub){//covered

    let Code=esprima.parseScript(CodetoSub);
    let i=0;
    while(Code['body'][i]['type']=='VariableDeclaration'){

        GlobalVariables.set(Code['body'][i]['declarations'][0]['id']['name'],Code['body'][i]['declarations'][0]['init']['value']);
        i++;
    }
    return Code['body'][i];//return the rest of the code(function)

}
function ExtractFunctionParams(FunctionCode,InputVector) {//covered

    if (FunctionCode['params'].length != 0) {
        if (FunctionCode['params'].length == 1) {
            FunctionParams.set(FunctionCode['params'][0]['name'], InputVector);

        }
        else {

            let IV = esprima.parseScript(InputVector);
            IV = IV['body'][0]['expression']['expressions'];

            for (let i = 0; i < FunctionCode['params'].length; i = i + 1) {
                FunctionParams.set(FunctionCode['params'][i]['name'], escodegen.generate(IV[i]));
            }
        }
    }
}


function LetHandler(LetExp,isTmp){

    let StrLetExp=escodegen.generate(LetExp);
    StrLetExp=StrLetExp.replace(';','');
    StrLetExp=StrLetExp.replace('let','');

    let tmp=StrLetExp.split('=');

    let SubExp=Substitute(tmp[1].trim(),isTmp);
    if(!isTmp)
        LocalVariables.set(tmp[0].trim(),SubExp.trim());//tmp[0] leftSide ,tmp[1] rightSide
    else
        TmpLocalVariables.set(tmp[0].trim(),SubExp.trim());


}

function AssignmentExpHandler(AssignmentExp,isTmp){

    let StrAssignmentExp=escodegen.generate(AssignmentExp);
    StrAssignmentExp=StrAssignmentExp.replace(';','');
    let tmp=StrAssignmentExp.split('=');
    if(!isTmp) {
        if (LocalVariables.get(tmp[0].trim()) == undefined) //no local variable
            SubbedCode.push(Substitute(StrAssignmentExp.trim(),isTmp)+';');
        else //local variable
            LocalVariables.set(tmp[0].trim(), Substitute(tmp[1].trim(),isTmp));
    }
    else {
        if (TmpLocalVariables.get(tmp[0].trim()) == undefined) //no local variable
            SubbedCode.push(Substitute(StrAssignmentExp.trim(),isTmp)+';');
        else //local variable
            TmpLocalVariables.set(tmp[0].trim(), Substitute(tmp[1].trim(),isTmp));

    }
}

function ReturnHandler(ReturnExp,isTmp){

    let StrReturnExp=escodegen.generate(ReturnExp);
    StrReturnExp=StrReturnExp.replace('return','');
    SubbedCode.push('return '+Substitute(StrReturnExp.trim(),isTmp));

}

function WhileHandler(WhileExp,isTmp){
    SubbedCode.push('while('+Substitute(escodegen.generate(WhileExp['test']),isTmp)+'){');

    BodyHandler(WhileExp['body'],isTmp);
    SubbedCode.push('}');
}

function IfHandler(IfExp){
    TmpLocalVariables=new Map(LocalVariables);
    SubbedCode.push('if('+Substitute(escodegen.generate(IfExp['test']))+'){');
    BodyHandler(IfExp['consequent'],true);
    SubbedCode.push('}');
    if(IfExp['alternate']!==null){
        TmpLocalVariables=new Map(LocalVariables);
        SubbedCode.push('else{');
        if(IfExp['alternate']['type']==='IfStatement')
            StatementHandler(IfExp['alternate'],true);
        else
            BodyHandler(IfExp['alternate'],true);
        SubbedCode.push('}');
    }
}

function Substitute(str,isTmp){
    let LocVar;
    if(isTmp)
        LocVar=TmpLocalVariables;
    else
        LocVar=LocalVariables;
    let iter = LocVar.keys();
    let key= iter.next().value;
    while(key!=undefined){

        if(str.includes(key)){
            str=str.split(key).join(LocVar.get(key));
        }
        key=iter.next().value;
    }
    return str;
}

function BodyHandler(FunctionCode,isTmp) {
    for(let i=0;i<FunctionCode['body'].length;i++){
        StatementHandler(FunctionCode['body'][i],isTmp);

    }
}

function StatementHandler(StatementExp,isTmp){

    FunctionMap.get(StatementExp['type'])(StatementExp,isTmp);

}



function EvalAndPaint(statements){

    for(let i=0;i<statements.length;i++){
        if(statements[i]['type']=='ExpressionStatement'){
            let StrStatement=(escodegen.generate(statements[i]['expression'])).split('=');
            FunctionParams.set(StrStatement[0].trim(),Substitute2(StrStatement[1].trim()));
        }
        if(statements[i]['type']=='IfStatement'){
            EvalAndPaintIfExp(statements[i]);
        }
    }
}

function EvalAndPaintIfExp(IfExp){
    let test=(escodegen.generate(IfExp['test'])).trim();
    let result=eval(Substitute2(test));
    if(result)//paint green
        PaintList.push('lightgreen');
    else//paint red
        PaintList.push('red');
    if(IfExp['alternate']!==null)
        EvalAndPaint(IfExp['alternate']['body']);
}

function Substitute2(strExp){
    let iter = FunctionParams.keys();
    let key= iter.next().value;
    while(key!=undefined){

        if(strExp.includes(key)){
            strExp=strExp.split(key).join(FunctionParams.get(key));
        }
        key=iter.next().value;
    }
    return strExp;
}