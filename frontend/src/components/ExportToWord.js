// ExportToWord.js
import React, { useState, useEffect } from 'react';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { utils } from 'xlsx';

const ExportToWord = ({ selectedEmployees, vacationStartDates, vacationEndDates, employees, handleSelectEmployee, handleStartDateChange, handleEndDateChange }) => {
    const [jobTypes, setJobTypes] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const fetchJobTypes = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/job-types/');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setJobTypes(data);
            } catch (error) {
                console.error('Error fetching job types:', error);
            }
        };

        const fetchDepartments = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/departments/');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        fetchJobTypes();
        fetchDepartments();
    }, []);

    const handleExport = () => {
        if (selectedEmployees.length === 0) {
            alert("Нет выбранных сотрудников для экспорта.");
            return;
        }

        const docs = selectedEmployees.map(emp => {
            const jobType = jobTypes.find(job => job.id === emp.job_type)?.name || 'Не указано';
            const department = departments.find(dept => dept.id === emp.department)?.name || 'Не указано';
            const vacationStart = vacationStartDates[emp.id]
                ? vacationStartDates[emp.id].toLocaleDateString()
                : 'Не указано';
            const vacationEnd = vacationEndDates[emp.id]
                ? vacationEndDates[emp.id].toLocaleDateString()
                : 'Не указано';

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: `Заявление на отпуск`,
                            heading: 'Title',
                        }),
                        new Paragraph({
                            text: `Я, ${emp.first_name} ${emp.last_name}, занимающий должность "${jobType}" в отделе "${department}", прошу предоставить мне отпуск.`,
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            text: `Дата начала отпуска: ${vacationStart}`,
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            text: `Дата окончания отпуска: ${vacationEnd}`,
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            text: `Подпись: ____________`,
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            text: `Дата генерации документа: ${new Date().toLocaleDateString()}`,
                            spacing: { after: 200 },
                        }),
                    ],
                }],
            });

            return doc;
        });

        docs.forEach((doc, index) => {
            Packer.toBlob(doc).then(blob => {
                saveAs(blob, `employee_${selectedEmployees[index].first_name}_${selectedEmployees[index].last_name}_vacation_request.docx`);
            });
        });
    };
    const handleExportExcel = () => {
        if (selectedEmployees.length === 0) {
            alert("Нет выбранных сотрудников для экспорта.");
            return;
        }

        // Подготовка данных для экспорта
        const exportData = selectedEmployees.map((emp) => {
            return {
                "Имя": emp.first_name,
                "Фамилия": emp.last_name,
                "Дата начала отпуска": vacationStartDates[emp.id]
                    ? vacationStartDates[emp.id].toLocaleDateString()
                    : 'Не указано',
                "Дата окончания отпуска": vacationEndDates[emp.id]
                    ? vacationEndDates[emp.id].toLocaleDateString()
                    : 'Не указано'
            };
        });

        const worksheet = utils.json_to_sheet(exportData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Employees');

        XLSX.writeFile(workbook, 'employees.xlsx');
    };

    return (
        <div>
            <div className="employee-list-container">
                <div className="employee-list">
                    {/* Список сотрудников с флажками для выбора */}
                    {employees.map((emp) => (
                        <div key={emp.id} className="employee-item">
                            <input
                                type="checkbox"
                                checked={selectedEmployees.includes(emp)}
                                onChange={() => handleSelectEmployee(emp)}
                                className="employee-checkbox"
                            />
                            <span className="employee-name">
                                {emp.first_name} {emp.last_name}
                            </span>

                            {/* Календарь для выбора даты начала отпуска */}
                            <DatePicker
                                selected={vacationStartDates[emp.id]}
                                onChange={(date) => handleStartDateChange(emp.id, date)}
                                placeholderText="Начало отпуска"
                                className="date-picker"
                            />

                            {/* Календарь для выбора даты окончания отпуска */}
                            <DatePicker
                                selected={vacationEndDates[emp.id]}
                                onChange={(date) => handleEndDateChange(emp.id, date)}
                                placeholderText="Окончание отпуска"
                                className="date-picker"
                            />
                        </div>
                    ))}
                </div>

                <div className="export-buttons">
                    {/* Кнопки для экспорта */}
                    <button className="export-button" onClick={handleExport} disabled={selectedEmployees.length === 0}>
                        Экспорт в Word
                    </button>
                    <button className="export-button" onClick={handleExportExcel} disabled={selectedEmployees.length === 0}>
                        Экспорт в Excel
                    </button>
                </div>

                {/* Предварительный просмотр документов */}
                {selectedEmployees.length > 0 && (
                    <div className="preview-container">
                        <h3>Предварительный просмотр документов:</h3>
                        {selectedEmployees.map((emp) => {
                            const startDate = vacationStartDates[emp.id]
                                ? vacationStartDates[emp.id].toLocaleDateString()
                                : 'Не указано';
                            const endDate = vacationEndDates[emp.id]
                                ? vacationEndDates[emp.id].toLocaleDateString()
                                : 'Не указано';

                            return (
                                <div key={emp.id} className="preview-item">
                                    <h4>Заявление на отпуск для {emp.first_name} {emp.last_name}</h4>
                                    <p>Дата начала отпуска: {startDate}</p>
                                    <p>Дата окончания отпуска: {endDate}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportToWord;
