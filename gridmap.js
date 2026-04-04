async function init() {
    await customElements.whenDefined('gmp-map');

    const mapElement = document.querySelector('gmp-map');
    const map = mapElement.innerMap;

    const marker = document.querySelector('gmp-advanced-marker');
    const placePicker = document.querySelector('gmpx-place-picker');
    const infowindow = new google.maps.InfoWindow();

    map.setOptions({
        mapTypeControl: false
    });

    // 地址选择
    placePicker.addEventListener('gmpx-placechange', () => {
        const place = placePicker.value;

        if (!place.location) {
            window.alert("No details available for input: '" + place.name + "'");
            infowindow.close();
            marker.position = null;
            return;
        }

        if (place.viewport) {
            map.fitBounds(place.viewport);
        } else {
            map.setCenter(place.location);
            map.setZoom(17);
        }

        marker.position = place.location;

        infowindow.setContent(
            `<strong>${place.displayName}</strong><br>
            <span>${place.formattedAddress}</span>`
        );

        infowindow.open(map, marker);
    });

    // 画网格
    drawGrid(map);
}

function drawGrid(map) {
    const gridSizeLat = 10;
    const gridSizeLng = 20;

    const lineStyle = {
        strokeColor: "#000000",
        strokeOpacity: 0.4,
        strokeWeight: 1,
        map: map
    };

    // ===== 画线（一次性，不变）=====
    for (let lat = -90; lat <= 90; lat += gridSizeLat) {
        for (let lng = -180; lng < 180; lng += gridSizeLng) {
            new google.maps.Polyline({
                ...lineStyle,
                path: [{ lat, lng }, { lat, lng: lng + gridSizeLng }]
            });
        }
    }

    for (let lng = -180; lng <= 180; lng += gridSizeLng) {
        for (let lat = -90; lat < 90; lat += gridSizeLat) {
            new google.maps.Polyline({
                ...lineStyle,
                path: [{ lat, lng }, { lat: lat + gridSizeLat, lng }]
            });
        }
    }

    // ===== 标签：只渲染视窗内的 =====
    let activeLabels = [];

    function updateLabels() {
        // 缩放太小时不显示标签
        if (map.getZoom() < 3) {
            activeLabels.forEach(m => m.setMap(null));
            activeLabels = [];
            return;
        }

        const bounds = map.getBounds();
        if (!bounds) return;

        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // 计算视窗内覆盖的网格范围
        const latMin = Math.floor(sw.lat() / gridSizeLat) * gridSizeLat;
        const latMax = Math.floor(ne.lat() / gridSizeLat) * gridSizeLat;
        const lngMin = Math.floor(sw.lng() / gridSizeLng) * gridSizeLng;
        const lngMax = Math.floor(ne.lng() / gridSizeLng) * gridSizeLng;

        // 清除旧标签
        activeLabels.forEach(m => m.setMap(null));
        activeLabels = [];

        // 只创建视窗内的标签
        for (let lat = latMin; lat <= latMax; lat += gridSizeLat) {
            for (let lng = lngMin; lng <= lngMax; lng += gridSizeLng) {
                // 边界检查
                if (lat < -90 || lat >= 90) continue;
                if (lng < -180 || lng >= 180) continue;

                const centerLat = lat + gridSizeLat / 2;
                const centerLng = lng + gridSizeLng / 2;
                const letterLat = String.fromCharCode(lat / gridSizeLat + 74);
                const letterLng = String.fromCharCode(lng / gridSizeLng + 74);

                const m = new google.maps.Marker({
                    position: { lat: centerLat, lng: centerLng },
                    map: map,
                    label: {
                        text: `${letterLng}${letterLat}`,
                        color: "#ff0000",
                        fontSize: "20px",
                        fontWeight: "bold"
                    },
                    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 }
                });

                activeLabels.push(m);
            }
        }
    }

    // 地图移动/缩放结束后更新
    map.addListener('idle', updateLabels);
    // 初始化时执行一次
    updateLabels();
}

document.addEventListener('DOMContentLoaded', init);