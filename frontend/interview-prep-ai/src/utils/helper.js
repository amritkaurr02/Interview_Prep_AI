export const validateEmail = (email) =>{
    const regex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
//Regular Expression(regex) sequence of characters that defines search pattern helps to validate input and match text
//^start of string, $end of string, 