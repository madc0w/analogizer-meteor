const version = "1.0.1";
const buildNumber = Math.floor(+new Date() / (24 * 60 * 60));
console.log("*** setting buildNumber ", buildNumber);

App.icons({
	// Android
	android_mdpi : "resources/icons/mipmap-mdpi/ic_launcher.png",
	android_hdpi : "resources/icons/mipmap-hdpi/ic_launcher.png",
	android_xhdpi : "resources/icons/mipmap-xhdpi/ic_launcher.png",
	android_xxhdpi : "resources/icons/mipmap-xxhdpi/ic_launcher.png",
	android_xxxhdpi : "resources/icons/mipmap-xxxhdpi/ic_launcher.png",
});


App.launchScreens({
	// Android
	android_mdpi_portrait : "resources/splash/drawable-mdpi/background.9.png",
	android_mdpi_landscape : "resources/splash/drawable-mdpi/background.9.png",
	android_hdpi_portrait : "resources/splash/drawable-hdpi/background.9.png",
	android_hdpi_landscape : "resources/splash/drawable-hdpi/background.9.png",
	android_xhdpi_portrait : "resources/splash/drawable-xhdpi/background.9.png",
	android_xhdpi_landscape : "resources/splash/drawable-xhdpi/background.9.png",
	android_xxhdpi_portrait : "resources/splash/drawable-xxhdpi/background.9.png",
	android_xxhdpi_landscape : "resources/splash/drawable-xxhdpi/background.9.png",
	android_xxxhdpi_portrait : "resources/splash/drawable-xxxhdpi/background.9.png",
	android_xxxhdpi_landscape : "resources/splash/drawable-xxxhdpi/background.9.png",
});


App.info({
	id : "com.idlhs22anb0yam.nurrkag7nxje",
	name : "Analogizer",
	author : "Marc A. Donis",
	email : "mad7@runbox.com",
	website : "http://heliosophiclabs.com/analogizer",
	version : version,
	buildNumber : buildNumber
});
