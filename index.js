const CronJob = require('cron').CronJob;
const { exec } = require('child_process')
const axios = require('axios');

function main() { 
    const HIGH_CHARGE_PERCENTAGE = 100;
    const LOW_CHARGE_PERCENTAGE = 10;
    
    exec('powershell -command (Get-WmiObject Win32_Battery).EstimatedChargeRemaining', (error, stdout, stderr) => {
        const percentage = stdout;

        if (error) {
            throw new Error('Erro ao executar comando');
        }

        if(!percentage) {
            throw new Error('Não foi possível capturar o nível da bateria');
        }
        
        if (percentage >= HIGH_CHARGE_PERCENTAGE) {
            return axios.get('https://www.virtualsmarthome.xyz/url_routine_trigger/activate.php?trigger=77b64f995-4b7a-4fe9-bee2-ef376f9c774f&token=6797577f-5363-48cf-817d-267e10b91d56&response=json')
                .then(res => {
                    if(res.data.URLRoutineTrigger.triggerActivationStatus != 'success') {
                        return console.log('Falha ao desligar tomada')
                    }

                    return console.log(new Date() + 'Tomada desligada')
                })
                .catch(error => {
                    console.error(error)
                })
        } else if (percentage <= LOW_CHARGE_PERCENTAGE) {
            return axios.get('https://www.virtualsmarthome.xyz/url_routine_trigger/activate.php?trigger=000ad3174-710d-4e16-93f1-348446e51e17&token=e7e8097d-6491-4034-a468-30219cfc16b5&response=json')
                .then(res => {
                    if(res.data.URLRoutineTrigger.triggerActivationStatus != 'success') {
                        return console.log('Falha ao ligar tomada')
                    }

                    return console.log(new Date() + 'Tomada ligada')
                })
                .catch(error => {
                    console.error(error)
                })
        }
    });
}
main()

new CronJob({
    cronTime: '0 */3 * * * *',
    onTick:() => main(),
    start: true,
    timeZone: 'America/Sao_Paulo'
})