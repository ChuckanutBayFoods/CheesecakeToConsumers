var flavorData = [
    {
        id: 1,
        platedImage: '../img/very-berry.png',
        nonPlatedImage: '../img/very-berry-no-plate.png',
        name: 'Very Berry',
        description: 'Fruit from the pacific northwest swirled into the batter on a chocolate crust.',
        glutenFree: true
    },
    {
        id: 2,
        platedImage: '../img/very-berry.png',
        nonPlatedImage: '../img/very-berry-no-plate.png',
        name: 'Chocolate Truffle',
        description: 'Original New York style cheesecake with a cinnamon crust.',
        glutenFree: false
    },
    {
        id: 3,
        platedImage: '../img/very-berry.png',
        nonPlatedImage: '../img/very-berry-no-plate.png',
        name: 'New York',
        description: 'Original New York style cheesecake with a cinnamon crust.',
        glutenFree: false
    },
    {
        id: 4,
        platedImage: '../img/very-berry.png',
        nonPlatedImage: '../img/very-berry-no-plate.png',
        name: 'White Chocolate Raspberry',
        description: 'Original New York style cheesecake with a cinnamon crust.',
        glutenFree: true
    }
]

function getFlavorById(id) {
    var flavor;
    $.each(flavorData, function(i, v) {
        if (v.id == id) {
            flavor = v;
            return false;
        }
    });
    return flavor;
}