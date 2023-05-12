import { createPopup, createNhoodPopup, createBlockgroupPopup, addMarker } from "./popup.js";

//https://api.mapbox.com/styles/v1/keelbn/cl8c2nvmq003114li896sf85z/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoia2VlbGJuIiwiYSI6ImNqaWVseGZjZzA3emMzdnAxM296OTFjNG8ifQ.W2j9Y2mz4t6vGRyKJk_Nyw

const colorsVacant = ["#D1BCA6", "#8F8172", "#3A352F"];
const colorsRepair = ["#85C07F", "#4A7246", "#2D4A2A"];
const colorsSale = ["#AFC6E1", "#517CB1", "#1B3350"];
const cGray = "#666666";

function styleByArea(variable, likelihood){
    if (variable === "vacant") {
        if (likelihood < 0.05) {
            return ({ 
            fill: true,
            fillColor: colorsVacant[0],
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsVacant[0],
            });
        } else if (likelihood  >= 0.05 && likelihood < 0.11) {
            return ({ 
            fill: true,
            fillColor: colorsVacant[1],
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsVacant[1],
            }); 
        } else if (likelihood  >= 0.11) {
            return ({ 
            fill: true,
            fillColor: colorsVacant[2],
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsVacant[2],
            }); 
        } else {
            return ({ 
            fill: true,
            fillColor: cGray,
            fillOpacity: 0.8,
            opacity: 0.8,
            color:cGray,
            });
        }
    } else if (variable === "permit") {
            if (likelihood < 0.21) {
            return ({ 
            fill: true,
            fillColor: colorsRepair[0],
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsRepair[0],
            });
        } else if (likelihood  >= 0.21 && likelihood < 0.35) {
            return ({ 
            fill: true,
            fillColor: colorsRepair[1],
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsRepair[1],
            }); 
        } else if (likelihood  >= 0.35) {
            return ({ 
            fill: true,
            fillColor: colorsRepair[2],
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsRepair[2],
            }); 
        } else {
            return ({ 
            fill: true,
            fillColor: cGray,
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsRepair[2],
            });
        }
    } else if (variable === "transfer") {
            if (likelihood < 0.25) {
            return ({ 
            fill: true,
            fillColor: colorsSale[0],
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsSale[0],
            });
        } else if (likelihood  >= 0.25 && likelihood < 0.33) {
            return ({ 
            fill: true,
            fillColor: colorsSale[1],
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsSale[1],
            }); 
        } else if (likelihood  >= 0.33) {
            return ({ 
            fill: true,
            fillColor: colorsSale[2],
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsSale[2],
            }); 
        } else {
            return ({ 
            fill: true,
            fillColor: cGray,
            fillOpacity: 0.8,
            opacity: 0.8,
            color:colorsSale[2],
            });
        }
    }
};

function changeLegend(variable){
    if (variable == "vacant") {
        //change the background color of the span with id "legendMid"
        document.getElementById("legendLow").style.backgroundColor = colorsVacant[0];
        document.getElementById("legendMid").style.backgroundColor = colorsVacant[1];
        document.getElementById("legendHigh").style.backgroundColor = colorsVacant[2];
    } else if (variable == "permit") {
        document.getElementById("legendLow").style.backgroundColor = colorsRepair[0];
        document.getElementById("legendMid").style.backgroundColor = colorsRepair[1];
        document.getElementById("legendHigh").style.backgroundColor = colorsRepair[2];
    } else if (variable == "transfer") {
        document.getElementById("legendLow").style.backgroundColor = colorsSale[0];
        document.getElementById("legendMid").style.backgroundColor = colorsSale[1];
        document.getElementById("legendHigh").style.backgroundColor = colorsSale[2];
    }
};

function initMap() {
    //Making base tile layer
    const map = L.map('map', {maxZoom:18}).setView([39.99, -75.15], 11);

    map.setMaxBounds(map.getBounds());

    L.tileLayer('https://api.mapbox.com/styles/v1/keelbn/clh4dwlpw018s01qngrg20059/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoia2VlbGJuIiwiYSI6ImNqaWVseGZjZzA3emMzdnAxM296OTFjNG8ifQ.W2j9Y2mz4t6vGRyKJk_Nyw', {
        maxZoom: 18,
        minZoom: 11,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let radio = document.querySelectorAll('input[name="variable"]');
    let range = document.querySelector("#spreadRange");

    let vectorTileStylingNhood = {
        
        prediction_nhoods: (properties) => { 
            let spread = document.querySelector("#spreadRange");
            let variable = document.querySelector('input[name="variable"]:checked').value;
            let likelihood = properties[`spread${spread.value}_${variable}`];
            return styleByArea(variable, likelihood);
        }
    };

    let vectorTileStylingBlocks = {
        
        prediction_blockgroup: (properties) => { 
            let spread = document.querySelector("#spreadRange");
            let variable = document.querySelector('input[name="variable"]:checked').value;
            let likelihood = properties[`spread${spread.value}_${variable}`];
            return styleByArea(variable, likelihood);
        }
    };

    let vectorTileStylingParcels = {
        
        predictions_parcels: (properties) => { 
            let spread = document.querySelector("#spreadRange");
            let variable = document.querySelector('input[name="variable"]:checked').value;
            let likelihood = properties[`spread${spread.value}_${variable}`];
            return styleByArea(variable, likelihood);
        }
    };    

    // Nhood
    const nhoods = L.vectorGrid.protobuf("https://storage.googleapis.com/fire_recovery_data_lake/tiles/neighborhoods/{z}/{x}/{y}.pbf", {
        maxZoom: 12,
        minZoom: 11,
        vectorTileLayerStyles: vectorTileStylingNhood, 
        interactive: true,
    }).addTo(map);

    // Block Group
    const blocks = L.vectorGrid.protobuf("https://storage.googleapis.com/fire_recovery_data_lake/tiles/blockgroups/{z}/{x}/{y}.pbf", {
        maxZoom: 15,
        minZoom: 13,
        vectorTileLayerStyles: vectorTileStylingBlocks,
        interactive: true,
    }).addTo(map);

    // Address
    const parcels = L.vectorGrid.protobuf("https://storage.googleapis.com/fire_recovery_data_lake/tiles/parcels/{z}/{x}/{y}.pbf", {
        maxZoom: 18,
        minZoom: 16,
        vectorTileLayerStyles: vectorTileStylingParcels,
        interactive: true,
    }).addTo(map);

    //Update the lengend to the radio button's current variable
    changeLegend(document.querySelector('input[name="variable"]:checked').value);
    
    //use leaflet redraw method on points layer when radio or range are changed
    radio.forEach(radio => {
        radio.addEventListener('change', function(){
            nhoods.redraw();
            blocks.redraw();
            parcels.redraw();
            changeLegend(document.querySelector('input[name="variable"]:checked').value);
        })
    })

    range.addEventListener('change', function(){
        nhoods.redraw();
        blocks.redraw();
        parcels.redraw();
        changeLegend(document.querySelector('input[name="variable"]:checked').value);
    })

    const markerLayer = L.layerGroup().addTo(map);

    //when clicking on a neighborhood, display the name of the neighborhood
    nhoods.on('click', function(e) {
        // markerLayer.clearLayers();
        // let nhood = e.layer.properties;
        // let nhoodName = nhood['neighborhood'];
        // let nhoodLikelihood = nhood[`spread${range.value}_${document.querySelector('input[name="variable"]:checked').value}`];
        // let popupContent = `<h6>${nhoodName}</h6><h6>Probability: ${nhoodLikelihood}</h6>`
        // markerLayer.addLayer(L.popup().setLatLng(e.latlng).setContent(popupContent));
        createNhoodPopup(e.layer.properties, document.querySelector('input[name="variable"]:checked').value, e.latlng, markerLayer);
    });

    //when clicking on a block group, display the name of the block group
    blocks.on('click', function(e) {
        markerLayer.clearLayers();
        // let nhood = e.layer.properties;
        // let nhoodName = nhood['block_group'];
        // let nhoodLikelihood = nhood[`spread${range.value}_${document.querySelector('input[name="variable"]:checked').value}`];
        // let popupContent = `<h6>${nhoodName}</h6> <h6>Probability: ${nhoodLikelihood}</h6>`
        // markerLayer.addLayer(L.popup().setLatLng(e.latlng).setContent(popupContent));
        createBlockgroupPopup(e.layer.properties, document.querySelector('input[name="variable"]:checked').value, e.latlng, markerLayer);
    });

    //when clicking on a block group, display the name of the block group
    parcels.on('click', function(e) {
        markerLayer.clearLayers();
        addMarker(e.latlng, markerLayer);
        createPopup(e.layer.properties, e.latlng, markerLayer);
    });
    return map;
}

export {
    initMap,
}