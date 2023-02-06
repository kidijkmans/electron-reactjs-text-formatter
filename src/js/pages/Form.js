import React from 'react';
import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Menu from '../components/Menu';

import useMultiStepForm from '../components/form/useMultiStepForm';
import TextForm from "../components/form/Textform";
import OptionsForm from "../components/form/Optionsform";
import ResultForm from "../components/form/Resultform";

const INITIAL_DATA = {
    unformattedText: "",
    source: "",
    columnsOptions: [],
    fullTextOptions: [
        { id: 0, columnType: 'gemeente', option: 'waar', selection: 'overal'},
        { id: 1, columnType: 'snelheid', option: 'waar', selection: 'overal'},
        { id: 2, columnType: 'snelheid', option: 'nummers', selection: 0}
    ],
    formattedText: ""
}

let lastUnformattedText = "";

export default function Form() {

    /*
    Manage data
    */

    const [data, setData] = useState(INITIAL_DATA);

    const [gemeenteSelected, setGemeenteSelected] = useState(false);
    const [snelheidSelected, setSnelheidSelected] = useState(false);

    function updateFields(fields) {
        setData(prev => {
            return { ...prev, ...fields }
        })
    }

    function addColumnsToOptionsData(columns) {
        const newColumns = [];
        for (let i = 0; i < columns.length; i++) {
            newColumns.push({ id: i, content: columns[i], columnType: '' });
        }
        // Add detected columns to data to dynamically show in form
        updateFields({columnsOptions: newColumns});
        // Reset full text options data to default
        updateFullTextOptions(0, 'overal');
        updateFullTextOptions(1, 'overal');
        updateFullTextOptions(2, 0);
        // Reset column options selected values to hide full text options
        setGemeenteSelected(false);
        setSnelheidSelected(false);
        // Update last formatted text
        lastUnformattedText = data.unformattedText;
    }

    function updateColumnType(index, columnType) {
        const newColumnsOptions = [...data.columnsOptions];
        newColumnsOptions[index].columnType = columnType;
        updateFields({columnsOptions: newColumnsOptions});

        // Show or hide additional full text options based on column options selected
        setGemeenteSelected(data.columnsOptions.filter(e => e.columnType === 'gemeente').length > 0 ? true : false);
        setSnelheidSelected(data.columnsOptions.filter(e => e.columnType === 'snelheid').length > 0 ? true : false);
    }

    function updateFullTextOptions(index, selection) {
        const newFullTextOptions = [...data.fullTextOptions];
        newFullTextOptions[index].selection = selection;
        updateFields({fullTextOptions: newFullTextOptions});
    }

    /*
    Implement form steps and content
    */

    const { steps, currentStepIndex, stepTitle, stepContent, isFirstStep, isLastStep, back, next, goTo, onSubmit, copy, startOver} = useMultiStepForm([
        <TextForm 
            {...data} 
            title={'Tekst invoeren'} 
            updateFields={updateFields} 
        />, 
        <OptionsForm 
            {...data} 
            title={'Opties selecteren'} 
            updateColumnType={updateColumnType}
            updateFullTextOptions={updateFullTextOptions}
            snelheidSelected={snelheidSelected} 
            gemeenteSelected={gemeenteSelected} 
            setGemeenteSelected={setGemeenteSelected} 
            setSnelheidSelected={setSnelheidSelected} 
        />,
        <ResultForm 
            {...data} 
            title={'Resultaat'} 
            updateFields={updateFields} 
        />
    ], data, lastUnformattedText, addColumnsToOptionsData, updateFields);

return (
    <>
    
        <Menu 
            steps={steps}
            currentStepIndex={currentStepIndex} 
            goTo={goTo} 
        />

        <div className="form-page page">

            <h1 className="header-title">{stepTitle}</h1>

            <form id="text-form" onSubmit={onSubmit}>

                {stepContent}

                <div className="buttonsContainer">

                    {!isFirstStep && (<button type="button" onClick={back}>Terug</button>)}

                    {isFirstStep && <button type="submit">Volgende</button>}

                    {currentStepIndex === 1 && <button type="submit">Verwerk</button>}

                    {isLastStep && <button type="button" onClick={startOver}>Begin opnieuw</button>}

                    {isLastStep && <button type="button" onClick={copy} className="copy-button">Kopiëer</button>}

                </div>
            </form>

            <ToastContainer />

        </div>
    </>
)}