const fs = require('fs')
const yargs = require('yargs')
const chalk = require('chalk')
const includeTags = require('./src/tags.js')
const includeNamingConvention = require('./src/namesAndTitles.js')
const encerrar = require('./src/encerrar.js')
const attempts = require('./src/attempts.js')
const inatividade = require('./src/inatividade.js')
const keywords = require('./src/keywords.js')
const tempoEspera = require('./src/tempoEspera.js')
const contactJourney = require("./src/contactJourney.js");
const addEventTrackers = require('./src/addEventTrackers.js')
const log = console.log

const walkPath = './json'

let filesToParse = []

// Todos os arquivos JSON dentro da pasta /json
fs.readdirSync(walkPath).forEach(file => {
    if(file.endsWith('.json')) 
        filesToParse.push('./json/' + file)
})

// Defina a ordem de execução dos scripts.
const executingOrder = [
    attempts, encerrar, inatividade,
    keywords, includeTags, includeNamingConvention,
    tempoEspera, contactJourney]

const args = yargs.argv

const exceptionsRaw = args?.except ?? args?.e
const someScripts = args?.only ?? args?.o

console.log(chalk.green.inverse('\nOrdem de execução:') + chalk.green(' Attempts -> Encerrar -> Inatividade -> Keywords -> Event Trackers -> Tags -> Names -> Tempo de Espera\n'))

/**
 * Imprime script sendo executados/ignorados.
 */
if(!someScripts) {
    let ignored = exceptionsRaw?.toLowerCase()?.split(/\s+/g)?.map(str => {return str.slice(0,1).toUpperCase() + str.slice(1)})?.join(', ')
    if(!ignored || ignored === 'undefined') ignored = 'Nenhum'
    console.log(chalk.yellow.inverse('Ignorados:') + chalk.yellow(' ' + ignored + '\n'))
} else {
    let listOfScripts = someScripts?.toLowerCase()?.split(/\s+/g)?.map(str => {return str.slice(0,1).toUpperCase() + str.slice(1)})?.join(', ')
    if(!listOfScripts || listOfScripts === 'undefined') listOfScripts = 'Nenhum'
    console.log(chalk.cyan.inverse('Executando apenas:') + chalk.cyan(' ' + listOfScripts + '\n'))
}


const exceptions = exceptionsRaw?.toLowerCase()?.split(/\s+/g) ?? ''
// Tempos de inatividade.
let afkTime = args.afk?.trim()?.split(' ')
if((afkTime && afkTime.length !== 2) && !exceptions.includes('inatividade')) 
    log(chalk.red.inverse('ERRO:'), chalk.red('Parâmetros de tempo de inatividade errados! Informe apenas dois tempos separados por espaço.'))

if(afkTime?.length > 1)
    args.afk = {
        delayBegin: afkTime[0],
        delayEnd: afkTime[1]
    }




if(args.actiontype === "leaving" || args.actiontype === "entering"){
    args.actiontype = args.actiontype.trim();
}
else{
    args.actiontype = "undefined";
}


const loadJSON = (path) => {
    try{
        const dataBuffer = fs.readFileSync(path)
        const dataJSON = dataBuffer.toString()

        const only = someScripts?.toLowerCase()?.split(/\s+/g) ?? ''

        let data = dataJSON

        /**
         * Executa os scripts na ordem definida.
         */
        for(let script of executingOrder){
            
            if(!only) {
                /**
                 * Não executa as funções explicitadas no parâmetro 'except'.
                 */
                if(exceptions.includes('attempts') && script === attempts) continue
                if(exceptions.includes('tags') && script === includeTags) continue
                if(exceptions.includes('names') && script === includeNamingConvention) continue
                if(exceptions.includes('encerrar') && script === encerrar) continue
                if(exceptions.includes('inatividade') && script === inatividade) continue
                if(exceptions.includes('keywords') && script === keywords) continue
                if(exceptions.includes('tempoespera') && script === tempoEspera) continue
                if(exceptions.includes('contactjourney') && script === contactJourney) continue
                if(exceptions.includes('eventtrackers') && script === addEventTrackers) continue

            } else {
                if(!only.includes('attempts') && script === attempts) continue
                if(!only.includes('tags') && script === includeTags) continue
                if(!only.includes('names') && script === includeNamingConvention) continue
                if(!only.includes('encerrar') && script === encerrar) continue
                if(!only.includes('inatividade') && script === inatividade) continue
                if(!only.includes('keywords') && script === keywords) continue
                if(!only.includes('tempoespera') && script === tempoEspera) continue
                if(!only.includes('contactjourney') && script === contactJourney) continue
                if(!only.includes('eventtrackers') && script === addEventTrackers) continue
            }

            data = script(data, path, {
                'all': args.all, 
                'maxNum': args.attempts,
                'std': args.std,
                'afk': args.afk,
                'keywords': args.keywords ?? args.k,
                'pushIntervals': args.pushIntervals ?? args.pi,
                'interval': args.interval,
                'intervalPos': args.intervalPos,
                'actiontype': args.actiontype
            })
        }

        return data
    }
    catch (e){
        console.log(e)
        return {
            'error': `Error: ${e}`
        }
    }
};

filesToParse.forEach((item, index) => {
    const modified = loadJSON(item)
    const saveFilePath = item.replace('./json/', './json-parsed/')

    // Salva em '/json-parsed'.
    fs.writeFileSync(saveFilePath, JSON.stringify(modified))
})

