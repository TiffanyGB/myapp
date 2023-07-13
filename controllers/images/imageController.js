function upload(req, res) {
    // if (req.userProfile === 'admin') {
    console.log('aa' + req.method);
    if (req.method === 'GET') {
        res.sendFile('/home/cytech/Stage/test_node_express/myapp/test2.html');
    } else if (req.method === 'OPTIONS') {
        res.status(200).json({ success: 'Access granted' });

    } else if (req.method === 'POST') {
        console.log('ok');
        res.status(200).json({});
    }

}

module.exports = {
    upload
}