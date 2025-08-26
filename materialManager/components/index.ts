import { ComponentExport,ComponentName } from '@types'
import { myPageHead } from "./my-page-head/index";
import { myPageWrapper } from './my-page-wrapper/index';
import { myPageBody } from './my-page-body/index'
import { myCharts } from './my-charts/index'
import { myRecordForm } from './my-record-form/index'
import { myDialog } from './my-dialog/index'
import { myMessage } from './my-message/index'
import { myMaterials } from './my-materials/index'
import { myInput } from './my-input/index'
import { myMaterialInput } from './my-material-input/index'
import { myOthers } from './my-others/index'

export default [
    myPageWrapper,
    myPageHead,
    myPageBody,
    myCharts,
    myRecordForm,
    myDialog,
    myMessage,
    myMaterials,
    myInput,
    myOthers,
    myMaterialInput
] as Array<ComponentExport<ComponentName>>