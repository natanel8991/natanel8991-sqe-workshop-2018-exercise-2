import $ from 'jquery';
import {SubCode} from './code-analyzer';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        document.getElementById('SubstitutedCode').innerHTML = '';
        let CodeToSub = $('#codePlaceholder').val();
        let InputVector = $('#InputVectorPlaceholder').val();
        let result = (SubCode(CodeToSub,InputVector));
        let Paintlist=result[1];
        let StrOutputCodeArray=result[0].split('\n');

        showSubstitutedCode(StrOutputCodeArray,Paintlist);
    });
});



function showSubstitutedCode(StrOutputCodeArray, PaintList) {
    let PLcounter=0;
    let htmlCodeObj = document.getElementById('SubstitutedCode'), caption = document.createElement('caption');


    htmlCodeObj.appendChild(caption);


    for (let i = 0; i < StrOutputCodeArray.length; i++) { // remove empty lines loop
        let nextLine = document.createElement('line' + i); // next line to show
        nextLine.appendChild(document.createTextNode(StrOutputCodeArray[i])); // add it's code text
        if(StrOutputCodeArray[i].includes('if')) {

            nextLine.setAttribute('style', 'background-color:' + PaintList[PLcounter] + ';');
            PLcounter++;
        }
        htmlCodeObj.appendChild(nextLine);
        htmlCodeObj.appendChild(document.createElement('br')); // add new line
    }
    htmlCodeObj.setAttribute('style', 'font-size:25px; white-space: pre;');

    document.getElementById('table').body.appendChild(htmlCodeObj);
}

