// src/utils/errorResponse.js
/**
 * Clase personalizada para generar respuestas de error estandarizadas
 * Extiende la clase Error nativa de JavaScript
 */
class ErrorResponse extends Error {
  /**
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} statusCode - Código de estado HTTP para la respuesta
   * @param {Object} [additionalInfo={}] - Información adicional opcional sobre el error
   */
  constructor(message, statusCode, additionalInfo = {}) {
    super(message);
    this.statusCode = statusCode;
    this.additionalInfo = additionalInfo;
    
    // Capturar la pila de llamadas para debugging
    Error.captureStackTrace(this, this.constructor);
    
    // Agregar timestamp al error
    this.timestamp = new Date().toISOString();
    
    // Incluir cualquier información adicional proporcionada
    Object.assign(this, additionalInfo);
  }
  
  /**
   * Método para convertir el error a un objeto JSON formateado
   * @returns {Object} Representación JSON del error
   */
  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.statusCode,
        timestamp: this.timestamp,
        ...(Object.keys(this.additionalInfo).length > 0 && { additionalInfo: this.additionalInfo })
      }
    };
  }
}

module.exports = ErrorResponse;