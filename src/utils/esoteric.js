/**
 * Calcula el signo zodiacal basado en el día y mes de nacimiento.
 * @param {Date} date - Objeto Date con la fecha de nacimiento
 * @returns {string} El signo zodiacal en español
 */
export function calculateZodiacSign(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Enero es 0 en JS

    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Acuario";
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Piscis";
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Tauro";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Géminis";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cáncer";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Escorpio";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagitario";
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "Capricornio";

    return "Desconocido";
}

/**
 * Calcula el Número de Camino de Vida (Numerología) sumando los dígitos de la fecha.
 * @param {Date} date - Objeto Date con la fecha de nacimiento
 * @returns {number} El número de camino de vida (1-9, 11, 22, 33)
 */
export function calculateLifePathNumber(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const sumDigits = (n) => {
        let sum = 0;
        while (n > 0 || sum > 9) {
            if (n == 0) {
                // Si es número maestro, retornamos sin reducir más (simplificado)
                if (sum === 11 || sum === 22 || sum === 33) return sum;
                n = sum;
                sum = 0;
            }
            sum += n % 10;
            n = Math.floor(n / 10);
        }
        return sum;
    };

    // Método: sumar todo y luego reducir
    // O sumar reducido de dia + mes + año.
    // Estandar numerologia: Reducir Dia, Reducir Mes, Reducir Año, Sumar esos 3, y Reducir resultado.

    const rDay = sumDigits(day);
    const rMonth = sumDigits(month);
    const rYear = sumDigits(year);

    let finalSum = rDay + rMonth + rYear;

    // Reducir la suma final, respetando maestros
    if (finalSum === 11 || finalSum === 22 || finalSum === 33) return finalSum;

    while (finalSum > 9 && finalSum !== 11 && finalSum !== 22 && finalSum !== 33) {
        let tempSum = 0;
        let tempN = finalSum;
        while (tempN > 0) {
            tempSum += tempN % 10;
            tempN = Math.floor(tempN / 10);
        }
        finalSum = tempSum;
    }

    return finalSum;
}
