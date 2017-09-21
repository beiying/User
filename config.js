exports.user_server = {
	num_worker: 1,
	port: 4002
};

exports.mongodb_options = {
	host: "JCloud-DB-01",
	port: 27018,
	database: "user"
};

exports.lego_remotes = [
	{host: "JCloud-04",port:6006},
	{host: "JCloud-04",port:6106}
];