const kunnaService = require("../services/kunnaService");
// Asegúrate que el require coincida con el nombre real del archivo en tu carpeta (Acquire.js)
const AcquiredData = require("../model/Acquire"); 

function health(req, res) {
    res.json({
        status: "ok",
        service: "acquire"
    });
}

async function acquireData(req, res) {
    try {
        const now = new Date();
        let targetDate = new Date(now);
        
        // Lógica de fechas
        if (now.getHours() >= 23) {
            targetDate.setDate(targetDate.getDate() + 1);
        }
        targetDate.setHours(0, 0, 0, 0);

        const timeEnd = new Date(targetDate);
        timeEnd.setDate(timeEnd.getDate() - 1);
        
        const timeStart = new Date(timeEnd);
        timeStart.setDate(timeStart.getDate() - 3);

        console.log(`[ACQUIRE] Buscando datos para Target: ${targetDate.toISOString()}`);

        const rawData = await kunnaService.fetchKunna(timeStart, timeEnd);

        // --- CORRECCIÓN CRÍTICA AQUÍ ---
        // Antes tenías v[1], que es el Alias ("MLU..."). 
        // El valor numérico suele venir en la posición 2 (o verifica si es la 0, pero la 1 es texto).
        // Usamos Number() para asegurar que no sea un string "120.5".
        const consumos = rawData.values.map(v => Number(v[2])); // <--- CAMBIO IMPORTANTE
        
        // Verificación de seguridad por si el orden de columnas cambia
        if (isNaN(consumos[0])) {
             throw new Error("El índice seleccionado no contiene números. Revisa las columnas de Kunna.");
        }

        if (consumos.length < 3) {
            return res.status(502).json({ error: "Kunna no devolvió suficientes datos históricos" });
        }

        // Construcción de Features (Vector de 7 elementos numéricos)
        const features = [
            consumos[0], consumos[1], consumos[2],
            targetDate.getHours(), targetDate.getDay(),
            targetDate.getMonth() + 1, targetDate.getDate()
        ];

        // Guardado en MongoDB
        const dataToSave = new AcquiredData({
            features: features,
            featureCount: 7,
            scalerVersion: "v1",
            // <--- CAMBIO: Agregamos dailyValues para cumplir con "Raw Data" de la arquitectura
            dailyValues: consumos, 
            metadata: { targetDate, source: "kunna-api" } 
            // Nota: Si tu Schema usa 'kunnaMeta' o 'fetchMeta' en vez de 'metadata', úsalos aquí.
        });

        const savedData = await dataToSave.save();

        // Respuesta al Orquestador (Cumple el Contrato)
        res.status(201).json({
            dataId: savedData._id,
            features: features,      // <--- Esto enviará números, no strings, arreglando el error del Predict
            featureCount: 7,
            scalerVersion: "v1",
            createdAt: savedData.createdAt
        });

    } catch (err) {
        console.error("[ACQUIRE] Error:", err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = { 
    health, 
    acquireData 
};