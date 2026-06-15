
export async function getPosition() {
    let position_data = {};
    const apiUrl = 'https://ipapi.co/json/';
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            position_data = await response.json();
        }
    } catch (error) {
        console.log('cannot fetch position', error);
    }
    return position_data;
}


