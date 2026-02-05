export const limpiarTexto = valor => String(valor || '').trim();

export const normalizarCorreo = correo => limpiarTexto(correo).toLowerCase();

export const esCorreoValido = correo => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizarCorreo(correo));

export const validarLogin = ({ correo, contraseña }) => {
  const correoLimpio = normalizarCorreo(correo);
  if (!correoLimpio || !contraseña) return 'Completa todos los campos';
  if (!esCorreoValido(correoLimpio)) return 'Correo inválido';
  if (contraseña.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return '';
};

export const validarRegistro = ({ nombre, correo, contraseña, confirmar }) => {
  const nombreLimpio = limpiarTexto(nombre);
  const correoLimpio = normalizarCorreo(correo);
  if (!nombreLimpio || !correoLimpio || !contraseña || !confirmar) return 'Completa todos los campos';
  if (!esCorreoValido(correoLimpio)) return 'Correo inválido';
  if (contraseña !== confirmar) return 'Las contraseñas no coinciden';
  if (contraseña.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return '';
};

export const validarCambioContraseña = ({ actual, nueva, confirmar }) => {
  if (!actual || !nueva || !confirmar) return 'Completa todos los campos';
  if (nueva !== confirmar) return 'Las contraseñas no coinciden';
  if (nueva.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return '';
};
