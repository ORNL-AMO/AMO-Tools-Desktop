
export const getRandomCoordinates = (height: number, width: number): {x: number, y: number} => {
    // todo find collision
    // todo pass in
    const screenWidth = window.innerWidth;
    const screenHeight = height;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    // Generate random coordinates within the visible area
    const randomX = Math.random() * screenWidth + scrollX;
    const randomY = Math.random() * screenHeight + scrollY;
    return {x: randomX, y: randomY};
}
