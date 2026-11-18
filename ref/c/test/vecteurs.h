/* Généré par tools/protocole/vecteurs-c.mjs depuis docs/protocole/vecteurs-v1.json : ne pas modifier à la main. */
#define V_HORLOGE 1790000000000ULL
#define V_X1 "fc9272eb3ee6d5e2"
#define V_X2 "b842f1866394ffe1"
static const char *V_PAQUETS[] = {
  "{\"m\":1,\"i\":\"0031109770501964\",\"o\":\"fc9272eb3ee6d5e2\",\"n\":\"xerion-1\",\"h\":255,\"t\":1790000000000,\"k\":\"ann\",\"d\":{\"cle\":\"BInVaOImXMqVR04V3S9oLW/d7OPrE3d8Oqprb4mLus61ZGrEex+bjT1L4ePnhAx0FOhsJNwStkl2hVQEdMprHk8=\",\"v\":[],\"r\":\"noeud\",\"p\":1,\"cap\":[\"relais\",\"stock\",\"pub\",\"mp\",\"ack\",\"pos\",\"coursier\",\"carte\"]}}", /* ann_x1 */
  "{\"m\":1,\"i\":\"5ac5082e82b789ce\",\"o\":\"fc9272eb3ee6d5e2\",\"n\":\"xerion-1\",\"h\":255,\"t\":1790000000000,\"k\":\"pub\",\"s\":\"#\",\"d\":{\"x\":\"bonjour le maillage\"}}", /* pub_clair */
  "{\"m\":1,\"i\":\"f2dd4391e1d00d2c\",\"o\":\"fc9272eb3ee6d5e2\",\"n\":\"xerion-1\",\"h\":255,\"t\":1790000000000,\"k\":\"pub\",\"s\":\"#soiree\",\"d\":{\"c\":\"BghwYaLyx6jeeKE+OtmsK4Er6Vh+SY8x23s6x+yo364dGlHbUaD163fBMgScPeXU6uXaekgKfrtAK/3CXLGKXVFEPy1YCZAMDcqSxRg30b9v5WjJNeTE/1nz42Z35cnhNoaOKayIcerkxlJekQoAgPW2rlv4OHiOpSS0y7ahZx/8WNY1CovjdIIpCnLrXdXWyidxQeIAAwI2kFw1Mt/2n1o0LeXuT7d5hYJ9rWcaUpyIUOFiQjd3ebox3gSOfk/wXBhlI5wpQmW2lZ/crwJ9WPUjIDH/bob0e1ew35H7r2KGoHFuiagiDo/iJrEU1es5+jgL9NyRYhxvJE9PlFjKZHTEYpSyZhEnMPbsyxxAqJY=\",\"v\":\"68UOArFajH2DyGsS\"}}", /* pub_salon_ferme */
  "{\"m\":1,\"i\":\"12a8e0f1fba09482\",\"o\":\"fc9272eb3ee6d5e2\",\"n\":\"xerion-1\",\"h\":255,\"t\":1790000000000,\"k\":\"mp\",\"a\":\"b842f1866394ffe1\",\"c\":8,\"d\":{\"c\":\"ibOnhgJ+iz1qaJKkYrJAxDkjupDq0UdhBp4qI9yD8nBjFAI6zFMKcL1qCGvVmkIHtGFbdVMCqbbX/wqmIMPoXttS/eQy8URR7ZLn2re47IIviwETNHUKC+GBWPkDeztZWYXYxBa4nDWQkmLBZ0XCpiJB48tlJwQHuBtV2RbvYro+QI6mTZS6w0EdBCHD0y0hW6UGktfElcVcyjIyo1NNDvLrkO+sTHQmYZHEtnGkoY/eVd2EqYhiStplCtbyr7jwHUFWfwPGFxeNS/E5VHAL29YgxtkxqPGR4XgjGh2fUUPHkeJn6ZTP1vhdwo9euVxlpOMm8VLrp9tn+46xopXvu4rKTRHRocm04SGKqiMl7Lk=\",\"v\":\"lgnwDGC1XhTHC530\"}}", /* mp_x1_x2 */
  "{\"m\":1,\"i\":\"a8ecadca5989deda\",\"o\":\"b842f1866394ffe1\",\"n\":\"xerion-2\",\"h\":255,\"t\":1790000000000,\"k\":\"ack\",\"a\":\"fc9272eb3ee6d5e2\",\"d\":{\"r\":\"12a8e0f1fba09482\"}}", /* ack_x2 */
  "{\"m\":1,\"i\":\"fc71112434f1b1c4\",\"o\":\"fc9272eb3ee6d5e2\",\"n\":\"xerion-1\",\"h\":255,\"t\":1790000000000,\"k\":\"pos\",\"a\":\"b842f1866394ffe1\",\"d\":{\"c\":\"mD7lr6eV71lJQGm6yTTsc3D1QZucqzlIAmdc7vsWngC4A+WG2uMmp2N0+JudptNspVONT5tG2k/6uFxFwGUZbjYY1P8bnMZCal5pFCrUBOy2dlwin6fTO0Swzlx7LuolutnktjStU/2FeT40vobjCF0xsxMB30MhWnSm30281kcghCyQcwE3l1pwEpd35g8Gcl4PbgPPMaTfA3rv0ZaKosDVTKxsFz4SZaX5nlD00EkedbkQISNQP5Mg0GCiMQ+K5kgwtmHyE/ky/4d7ZQAIsQgQ/t16ZgZzHeIPcE8lRm1qoNSiQPIwg7HjxoZBDacPTlGPZFwQeKZugN9KRnr8TicQ23aWdDiaGzSRZs/5jk0=\",\"v\":\"h2IHadBkRMCC1ffv\"}}", /* pos_x1_x2 */
};
static const char *V_NOMS[] = {"ann_x1", "pub_clair", "pub_salon_ferme", "mp_x1_x2", "ack_x2", "pos_x1_x2"};
#define V_NB 6
#define V_MORCEAUX_ID 0x01020304u
#define V_MORCEAUX_PAQUET 1
static const char *V_MORCEAUX_HEX[] = {"b1010203040001007b226d223a312c2269223a2235616335303832653832623738396365222c226f223a2266633932373265623365653664356532222c226e223a22786572696f6e2d31222c2268223a3235352c2274223a313739303030303030303030302c226b223a22707562222c2273223a2223222c2264223a7b2278223a22626f6e6a6f7572206c65206d61696c6c616765227d7d"};
#define V_NB_MORCEAUX 1
