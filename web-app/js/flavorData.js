var flavorData = [
    {
        id: 1,
        platedImage: '../img/very-berry.png',
        nonPlatedImage: '../img/very-berry-no-plate.png',
        name: 'Very Berry'
    },
    {
        id: 1,
        platedImage: '../img/very-berry.png',
        nonPlatedImage: '../img/very-berry-no-plate.png',
        name: 'Very Berry'
    },
    {
        id: 1,
        platedImage: '../img/very-berry.png',
        nonPlatedImage: '../img/very-berry-no-plate.png',
        name: 'Very Berry'
    },
    {
        id: 1,
        platedImage: '../img/very-berry.png',
        nonPlatedImage: '../img/very-berry-no-plate.png',
        name: 'Very Berry'
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