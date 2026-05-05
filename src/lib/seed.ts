import { collection, writeBatch, getDocs, query, serverTimestamp, doc } from 'firebase/firestore';
import { db } from './firebase';

const RAW_DATA = [
  {
    barangay: 'Suarez',
    cluster: 'Cluster I',
    voters: [
      { name: 'ABINES, REYMAR A.', precinct: '0174A', address: 'PUROK MAUSWAGON' },
      { name: 'ARQUILLANO, BEBELOU J.', precinct: '0179A', address: 'PUROK SUNFLOWER' },
      { name: 'ARQUILLANO, WINEFREDA H.', precinct: '0177A', address: 'PUROK SUNFLOWER' },
      { name: 'BESAS, LOVELY ANGELA M.', precinct: '0178A', address: 'PUROK BOUGAINVILLA WHITE' },
      { name: 'ECHAVEZ, CYNTHIA MAY B.', precinct: '0182A', address: 'UPPER TAYTAY' },
      { name: 'FERNANDEZ, BERLINDA L.', precinct: '0175A', address: 'PUROK BOUGAINVILLA RED' },
      { name: 'GENERALAO, ARLI T.', precinct: '0173B', address: 'PUROK MAKUGIHON' },
      { name: 'JUTBA, MERALUNA T.', precinct: '0173B', address: 'PUROK BOUGAINVILLA WHITE' },
      { name: 'MAGLANGIT, EDGARDO H.', precinct: '0174A', address: 'PUROK SUNFLOWER' },
      { name: 'SASIL, CYNDEE MAE T.', precinct: '0181A', address: '0129 PRK. BOUGAINVILLA' }
    ]
  },
  {
    barangay: 'Maria Cristina',
    cluster: 'Cluster I',
    voters: [
      { name: 'ABELLANOSA, JUSTINE R.', precinct: '0330A', address: 'PUROK 21, ZONE 9 FUENTES' },
      { name: 'ABOBACAR, JERAMEEL C.', precinct: '0323A', address: 'PUROK 9, ZONE 3' },
      { name: 'BAGARES, CATHERINE A.', precinct: '0322A', address: 'PUROK 11 ZONE 4 FUENTES' },
      { name: 'CABALOG, JORDA', precinct: '0325A', address: 'PUROK 8 ZONE 20 FUENTES' },
      { name: 'CASER, MARIBEL B.', precinct: '0323B', address: 'PUROK 22, ZONE 9' },
      { name: 'CASTRO, REGIELYN A.', precinct: '0333A', address: 'PUROK 21, ZONE 9 FUENTES' },
      { name: 'CUIZON, HAZEL C.', precinct: '0330A', address: 'PUROK 9A, ZONE 3' },
      { name: 'DUMANTAY, JEMAR F.', precinct: '0323A', address: 'PUROK 9A, ZONE 3' },
      { name: 'FERNANDEZ, EARL CAGNEY C.', precinct: '0323B', address: 'PUROK 9-A, ZONE 3' },
      { name: 'JAYME, SIMPLICIO JR P.', precinct: '0333A', address: 'PUROK 15 ZONE 6 FUENTES' },
      { name: 'LABIS, ALFREDO A.', precinct: '0319B', address: 'PUROK 20, ZONE 8' },
      { name: 'LAMITA, GLECEMAE T.', precinct: '0320A', address: 'PUROK 9, ZONE 3 FUENTES' },
      { name: 'MACALATAS, ALYSSA P.', precinct: '0326A', address: 'PUROK 7, ZONE 2 FUENTES' },
      { name: 'MAGSAYO, WENLIE T.', precinct: '0327A', address: 'PUROK 8A, ZONE 3' },
      { name: 'MARTINEZ, NELFA E.', precinct: '0322B', address: 'PUROK 9, ZONE 3' },
      { name: 'PAGLINAWAN, JERALDINE C.', precinct: '0327A', address: 'PUROK 23A, ZONE 10' },
      { name: 'PALGAN, LOI YANDEL C.', precinct: '0324A', address: 'PUROK 22 ZONE 9' },
      { name: 'PALMA, MARGIE L.', precinct: '0322B', address: 'PUROK 7, ZONE 2' },
      { name: 'REBUSTO, JEFFREY A.', precinct: '0321A', address: 'ZONE 5 PUROK 21' },
      { name: 'SABELLON, SALUSTIANO JR. R.', precinct: '0322A', address: 'PUROK 10, ZONE 4' },
      { name: 'TAMPON, JOHN LOYD M.', precinct: '0334A', address: 'PUROK 17, ZONE 7' },
      { name: 'TOLENTINO, JHON AL O.', precinct: '0320A', address: 'PUROK 15, ZONE 6' }
    ]
  },
  {
    barangay: 'Buru-un',
    cluster: 'Cluster I',
    voters: [
      { name: 'ABASOLO, ROSEMARIE S.', precinct: '0076A', address: 'PUROK 8A' },
      { name: 'ACUT, FLORDELIZ Y.', precinct: '0096A', address: 'PUROK 5 BLISS' },
      { name: 'ALCISTO, ROSEMARIE D.', precinct: '0082B', address: 'PUROK 8' },
      { name: 'ALFECHE, AILEE B.', precinct: '0080B', address: 'PUROK 8' },
      { name: 'ALFECHE, ALDEN B.', precinct: '0080B', address: 'PUROK 8' },
      { name: 'ALFECHE, DEMOSTHENES C.', precinct: '0082B', address: 'PUROK 8' },
      { name: 'ANCHES, JUDILYN L.', precinct: '0084B', address: 'PUROK 3 MIMBALUT' },
      { name: 'ANTIPOLO, FLORITA G.', precinct: '0076B', address: 'PUROK 1' },
      { name: 'APAS, CRISTINA B.', precinct: '0080A', address: 'PUROK 10-A' },
      { name: 'BACUS, LUZMINDA C.', precinct: '0076A', address: 'PUROK 6' },
      { name: 'BAHIAN, REGINA P.', precinct: '0096B', address: 'MIMBALUT' },
      { name: 'BALOGBOG, RHEA MAE J.', precinct: '0078B', address: 'PUROK 13 TIMOGA' },
      { name: 'BALOGBOG, SARAH JEAN', precinct: '0098B', address: 'PUROK 13' },
      { name: 'BARORO, MIRAFLOR', precinct: '0083A', address: 'PUROK 8' },
      { name: 'BAYAL, JHONRY MARK B.', precinct: '0094B', address: 'PUROK 11' },
      { name: 'BAYAL, MERCEDITA B.', precinct: '0094B', address: 'PUROK 11' },
      { name: 'BILLONED, MYRNA Q.', precinct: '0081A', address: 'PUROK 8' },
      { name: 'BRIAN, JEOSEPITO M.', precinct: '0088A', address: 'PUROK 9' },
      { name: 'BUENAVISTA, KEVIN JAMES C.', precinct: '0083A', address: 'PUROK 4' },
      { name: 'CALLOS, RODELIN A.', precinct: '0084A', address: 'PUROK 8A' },
      { name: 'CALUNSAG, AIDA V.', precinct: '0097A', address: 'PUROK 5 BLISS MIMBALOT' },
      { name: 'CAÑO, VALERIANO C.', precinct: '0087A', address: 'BURUUN' },
      { name: 'CANOY, FELISA S.', precinct: '0088A', address: 'PUROK 11 TIMOGA' },
      { name: 'CANOY, GAUDIOSA A.', precinct: '0077B', address: 'BURUUN, ILIGAN CITY' },
      { name: 'CANOY, GENEVIC S.', precinct: '0091B', address: 'PUROK 11' },
      { name: 'CANOY, NELMARIE D.', precinct: '0080B', address: 'PUROK 1-A' },
      { name: 'CANTON, REYNANTE G.', precinct: '0080A', address: 'PUROK 5 BLISS' },
      { name: 'CAPIN, JOY T.', precinct: '0077B', address: 'PUROK 1-A' },
      { name: 'CARBELLIDO, JENNIFER JANE G.', precinct: '0099A', address: 'PUROK 5' },
      { name: 'CATALAN, MEKYLA A.', precinct: '0084B', address: 'PUROK 8' },
      { name: 'CENAS, FLORENCIA L.', precinct: '0094A', address: 'PUROK 10-A' },
      { name: 'CUIZON, MEKYLA RAE', precinct: '0087A', address: 'PUROK 8' },
      { name: 'DELVO, LORNA E.', precinct: '0090B', address: 'PUROK 8' },
      { name: 'DENILA, ROMUALDA P.', precinct: '0092A', address: 'PUROK 5 BLISS' },
      { name: 'DEPIO, EDWIN B.', precinct: '0077A', address: 'PUROK 3' },
      { name: 'DIGAL, JOSEPHINE V.', precinct: '0092A', address: 'PUROK 8' },
      { name: 'DIVINAGRACIA, KAREN C.', precinct: '0084B', address: 'PUROK 10A' },
      { name: 'DIVINAGRACIA, RICA C.', precinct: '0092A', address: 'PUROK 10' },
      { name: 'DIVINAGRACIA, RYAN C.', precinct: '0083A', address: 'PUROK 10' },
      { name: 'DONQUE, DAUD S.', precinct: '0097A', address: 'PUROK 13' },
      { name: 'DORON, JESSIEL MAE C.', precinct: '0084B', address: 'PUROK 8' },
      { name: 'EDQUILAG, ROBERTA R.', precinct: '0090B', address: 'BURUUN' },
      { name: 'ENCINA, LETECIA B.', precinct: '0094A', address: 'PUROK 6A' },
      { name: 'ENDRECOSO, NORBERTA D. ', precinct: '0094B', address: 'PUROK 1' },
      { name: 'ESQUILLO, ANNA ELJEAN', precinct: '0096A', address: 'PUROK 5 BLISS' },
      { name: 'FUGOSO, VIVIANA M.', precinct: '0099A', address: 'PUROK 2 MIMBALOT' },
      { name: 'GARALDEZ, HELARIO', precinct: '0090A', address: 'PUROK 8' },
      { name: 'GASO, MARICEL ', precinct: '0091A', address: 'PUROK 1' },
      { name: 'GENERALAO, REBECCA, B.', precinct: '0094A', address: 'PUROK 10A' },
      { name: 'GERALDEZ, JHOVAN O.', precinct: '0091C', address: 'SPRING BURUUN' },
      { name: 'GERALDEZ, JUSTINA O.', precinct: '0097A', address: 'PUROK 8' },
      { name: 'GERASTA, LELANIE C.', precinct: '0097A', address: 'URBAN POOR SUBD. MIMBALOT' },
      { name: 'GOCOMON, MANILITA P.', precinct: '0092B', address: 'PUROK 2 MIMBALOT' },
      { name: 'GOYONAN, SHEMERYLE', precinct: '0096B', address: 'PUROK 8' },
      { name: 'HERNANE, VANESSA T.', precinct: '0077A', address: 'PUROK 12' },
      { name: 'HINOGUIN, EDNA D.', precinct: '0090A', address: 'PUROK 10-A' },
      { name: 'HINOGUIN, GINA D.', precinct: '0083A', address: 'PUROK 10' },
      { name: 'HINOGUIN, MELISSA P.', precinct: '0083A', address: 'PUROK 10-A' },
      { name: 'LAGNO, MIRAFLOR A.', precinct: '0079B', address: 'PUROK 10-A' },
      { name: 'LAURITO, JENNIFER Q.', precinct: '0099A', address: 'PUROK 8' },
      { name: 'LAURITO, JERRY P.', precinct: '0091A', address: 'PUROK 8' },
      { name: 'LOPECILLO, HELEN P.', precinct: '0095A', address: 'PUROK 11 TIMOGA' },
      { name: 'LUMANTOD, APRIL PAUL A.', precinct: '0096B', address: 'PUROK 8' },
      { name: 'LUMANTOD, MARICEL L.', precinct: '0092B', address: 'PUROK 8' },
      { name: 'MABALA, ALMA L.', precinct: '0098A', address: 'PUROK 8' },
      { name: 'MABALA, MARY JANE L.', precinct: '0086A', address: 'PUROK 8, BRGY BURUUN, ILIGAN CITY' },
      { name: 'MABANAL, DIARY ANN', precinct: '0084B', address: 'PUROK 8' },
      { name: 'MADULA, RICKY P.', precinct: '0099A', address: 'PUROK 5' },
      { name: 'MAGLANGIT, JUVELITO C.', precinct: '0085A', address: 'PUROK 5 BLISS' },
      { name: 'MIER, MARIA ERA L.', precinct: '0078B', address: 'PUROK 8' },
      { name: 'MONEVA, JOCELYN O.', precinct: '0077B', address: 'PUROK 2' },
      { name: 'OLIVEROS, ROSALIE D.', precinct: '0080B', address: 'PUROK 5 TIMOGA' },
      { name: 'OMPOY, ARNIEL T.', precinct: '0088A', address: 'PUROK 8 ' },
      { name: 'OMPOY, JOEL T.', precinct: '0080B', address: 'PUROK 8 ' },
      { name: 'OMPOY, LUDIVINA C.', precinct: '0094B', address: 'PUROK 8 ' },
      { name: 'ORTEGA, VANISA O.', precinct: '0083A', address: 'PUROK 10-A' },
      { name: 'OSOP, JOMARI M.', precinct: '0076B', address: 'PUROK 6' },
      { name: 'PAHAMUTANG, ERLINDA S.', precinct: '0089A', address: 'PUROK 10-A' },
      { name: 'PAPAS, BASILICA P.', precinct: '0099B', address: 'PUROK 5 BLISS MIMBALOT' },
      { name: 'PARA-ASE, JUSTINA', precinct: '0088A', address: 'PUROK 5 BLISS ' },
      { name: 'PARA-ASE, ESPEREDIONA P.', precinct: '0089A', address: 'PUROK 5 BLISS' },
      { name: 'PARADERO, MARY JEAN', precinct: '0092B', address: 'PUROK 5 BLISS' },
      { name: 'PARDILLO, GLORIA N.', precinct: '0088A', address: 'PUROK BLISS MIMBALOT' },
      { name: 'PENASO, FRELYN M.', precinct: '0088A', address: 'PUROK 9' },
      { name: 'PLAGTIOSA, JULITA A.', precinct: '0077A', address: 'PUROK 8' },
      { name: 'PULLOS, EDEN S.', precinct: '0086A', address: 'PUROK 10-A' },
      { name: 'QUISAGAN, GILBERTO S.', precinct: '0086A', address: 'SPRING SIDE PUROK 8' },
      { name: 'QUISAGAN, NORBERT S.', precinct: '0095B', address: 'PUROK 8 ' },
      { name: 'RAZO REGINA A.', precinct: '0095A', address: 'PUROK 1B MUMBALUT' },
      { name: 'RAZO, AIZA L.', precinct: '0098A', address: 'PUROK 1B MIMBALUT' },
      { name: 'RAZO, ANNA MARIE B.', precinct: '0088A', address: 'PUROK 3 MIMBALOT' },
      { name: 'RAZO, CONCHITA A.', precinct: '0081A', address: 'PUROK 3 MIMBALOT' },
      { name: 'RAZO, RAZEL', precinct: '0096A', address: 'PUROK 1B MUMBALUT' },
      { name: 'ROMAS, CYD D.', precinct: '0084B', address: 'PUROK 5 BLISS MIMBALOT' },
      { name: 'ROMAS, MARY JANE L.', precinct: '0086A', address: 'PUROK 5 BLISS' },
      { name: 'SABUCLALAO, MARGARITA E.', precinct: '0084B', address: 'PUROK 8A ' },
      { name: 'SACAY, ZYRABELLE M.', precinct: '0095A', address: 'PUROK 13 TIMOGA' },
      { name: 'SALAMIN, ALMERA U.', precinct: '0091C', address: 'PUROK 8' },
      { name: 'SALVADOR, ANTHONY E.', precinct: '0091B', address: 'PUROK 12' },
      { name: 'SALVADOR, SUSAN T.', precinct: '0087A', address: 'PUROK 8' },
      { name: 'SAMBUAT, AMADA E.', precinct: '0082A', address: 'PUROK 9' },
      { name: 'SANTIAGO, LADY FAIR S.', precinct: '0092B', address: 'PUROK 6' },
      { name: 'SASAM, ALONA S.', precinct: '0081A', address: 'MIMBALOT' },
      { name: 'SASAM, ANALIZA S.', precinct: '0089A', address: 'PUROK 4B MIMBALOT' },
      { name: 'SASAM, EVA N.', precinct: '0077B', address: 'PUROK 4B MIMBALOT' },
      { name: 'SECRETARIA, VIRGINIA B.', precinct: '0091C', address: 'PUROK 4 MIMBALOT' },
      { name: 'SERAPION, NHOMIE S.', precinct: '0082A', address: 'PUROK 13' },
      { name: 'SINGIDAS, GERALDINA, C.', precinct: '0079A', address: 'PUROK 10-A' },
      { name: 'SINGIDAS, JANLORD C.', precinct: '0079B', address: 'PUROK 10-A' },
      { name: 'SINGIDAS, REY', precinct: '0091B', address: 'PUROK 10A' },
      { name: 'SOLAMIN, ELMER E.', precinct: '0079A', address: 'PUROK 8' },
      { name: 'SUHOT, AIREEN A.', precinct: '0092A', address: 'PUROK 13' },
      { name: 'TABORA, JEFFREY M.', precinct: '0086A', address: 'PUROK 8' },
      { name: 'TACHADO, MARIE ANNE G.', precinct: '0091A', address: 'PUROK 10' },
      { name: 'TAPUYAO, LELANIE G.', precinct: '0076A', address: 'PUROK 2' },
      { name: 'TAYAG, MARELYN D.', precinct: '0076A', address: 'PUROK 11' },
      { name: 'TOYLO, ALLAN', precinct: '0097A', address: 'PUROK 8 ' },
      { name: 'TOYLO, JESSIE C.', precinct: '0097A', address: 'PUROK 8' },
      { name: 'TOYLO, JUNE F.', precinct: '0078B', address: 'PUROK 8' },
      { name: 'TOYLO, VICTORIA C.', precinct: '0090B', address: 'BURUUN' },
      { name: 'UBAN, ANN C.', precinct: '0099B', address: 'PUROK 1' },
      { name: 'UBAN, ROCEL L.', precinct: '0092A', address: 'PUROK 5 BLISS' },
      { name: 'UCO, HONORATO JR. C.', precinct: '0078A', address: 'PUROK 5 BLISS' },
      { name: 'UNABIA, ANICITA A.', precinct: '0093B', address: 'PUROK 8' },
      { name: 'UNABIA, DAN LLOYD U.', precinct: '0091C', address: 'PUROK 8' },
      { name: 'VALCURZA, LAIZA JANE E.', precinct: '0097A', address: 'PUROK 5' },
      { name: 'VICENTE, VERNALYN M.', precinct: '0087A', address: 'PUROK 13 TIMOGA' },
      { name: 'VILLANUEVA, ELMER S.', precinct: '0082A', address: 'PUROK 10-A' },
      { name: 'VILLANUEVA, ERNIE S.', precinct: '0084B', address: 'PUROK TONGGO' },
      { name: 'VILLANUEVA, GLORIA MAGDALENA Q.', precinct: '0086A', address: 'PUROK 10-A' },
      { name: 'VILLANUEVA, JULIETA', precinct: '0084B', address: 'PUROK TONGGO' },
      { name: 'VILLARUZ, MERLINDA D.', precinct: '0093A', address: 'PUROK 1B' },
      { name: 'VILLARUZ, NARCISO JR. S.', precinct: '0093A', address: 'PUROK 1B' },
      { name: 'WAGA, JULIETA F.', precinct: '0090B', address: 'PUROK 11' },
      { name: 'YUCO, ROXANNE C.', precinct: '0087A', address: 'PUROK 5 BLISS' },
      { name: 'ZAMORA, JOSEPHINE P.', precinct: '0086A', address: 'PUROK 1' },
    ]
  }
];

const COLORS = ['Red', 'Blue', 'Green', 'Yellow'];

export async function resetAndSeedDatabase() {
  try {
    const voterDocs = await getDocs(collection(db, 'voters'));
    const precinctDocs = await getDocs(collection(db, 'precincts'));
    
    console.log(`DELETING ${voterDocs.size} voters and ${precinctDocs.size} precincts...`);
    
    if (voterDocs.size + precinctDocs.size > 0) {
      const wipeBatch = writeBatch(db);
      voterDocs.docs.forEach(d => wipeBatch.delete(d.ref));
      precinctDocs.docs.forEach(d => wipeBatch.delete(d.ref));
      await wipeBatch.commit();
      console.log('BATCH DELETE SUCCESSFUL.');
    }

    console.log('DATABASE PURGED. Initializing real Iligan data...');

    const precinctMap = new Map();

    for (const group of RAW_DATA) {
      for (const v of group.voters) {
        if (!precinctMap.has(v.precinct)) {
          precinctMap.set(v.precinct, {
            name: `Precinct ${v.precinct}`,
            barangay: group.barangay,
            cluster: group.cluster,
            location_details: `${group.barangay}, Iligan City`,
            total_voters: 0,
            imageUrl: `https://images.unsplash.com/photo-1577493340887-b7bfff550145?auto=format&fit=crop&q=80&w=1000`,
            createdAt: serverTimestamp()
          });
        }
        precinctMap.get(v.precinct).total_voters++;
      }
    }

    // Step 1: Create Precincts
    const precinctRefs = new Map();
    const precinctBatch = writeBatch(db);
    
    for (const [id, data] of precinctMap.entries()) {
      const newRef = doc(collection(db, 'precincts'));
      precinctBatch.set(newRef, data);
      precinctRefs.set(id, { id: newRef.id, name: data.name, barangay: data.barangay, cluster: data.cluster });
    }
    await precinctBatch.commit();
    console.log('PRECINCTS CREATED.');

    // Step 2: Create Voters in chunks (Firestore batch limit is 500)
    let votersToCreate = [];
    for (const group of RAW_DATA) {
      for (const v of group.voters) {
        const pInfo = precinctRefs.get(v.precinct);
        votersToCreate.push({
          fullName: v.name,
          precinctId: pInfo.id,
          precinctName: pInfo.name,
          barangay: pInfo.barangay,
          cluster: pInfo.cluster,
          affiliationColor: 'Neutral',
          address: v.address,
          contactNumber: '',
          createdAt: serverTimestamp()
        });
      }
    }

    // Chunk size 500
    for (let i = 0; i < votersToCreate.length; i += 500) {
      const chunk = votersToCreate.slice(i, i + 500);
      const batch = writeBatch(db);
      chunk.forEach(vData => {
        const ref = doc(collection(db, 'voters'));
        batch.set(ref, vData);
      });
      await batch.commit();
      console.log(`VOTER CHUNK ${i / 500 + 1} COMMITTED.`);
    }

    console.log('DATABASE SEEDING COMPLETE WITH REAL DATA.');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
