const fs=require('fs');
const csv=require('csv-parser');

const inputFilePath='dog.csv';
const outputFilePath='cleaned_dog.csv';
const writeStream =fs.createWriteStream(outputFilePath);
writeStream.write('AnimalName,AnimalGender,AnimalBirthYear\n');

fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) =>{
        const { AnimalName, AnimalGender, AnimalBirthYear } = row;
        writeStream.write(`${AnimalName},${AnimalGender},${AnimalBirthYear}\n`);})
    .on('end', () =>{
        console.log('done');});