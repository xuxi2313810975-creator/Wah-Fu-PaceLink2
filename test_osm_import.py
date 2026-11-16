import importlib.util
from pathlib import Path
import tempfile
import unittest
spec=importlib.util.spec_from_file_location('import_osm',Path(__file__).resolve().parents[1]/'scripts/import-osm.py')
osm=importlib.util.module_from_spec(spec)
spec.loader.exec_module(osm)

class ImportGeometryTests(unittest.TestCase):
 def test_clipping_does_not_bridge_separate_entries(self):
  a=[114.131,22.247];b=[114.129,22.247];c=[114.129,22.250];d=[114.131,22.250]
  self.assertEqual(osm.clip_line([a,b,c,d]),[[a,[114.130,22.247]],[[114.130,22.250],d]])
  self.assertIsNone(osm.clip_segment(b,c))
 def test_reversed_segments_form_rings_but_missing_edges_do_not(self):
  rings,missing=osm.assemble([['a','b'],['c','b'],['c','d'],['a','d']])
  self.assertEqual(missing,0);self.assertEqual(len(rings),1);self.assertEqual(rings[0][0],rings[0][-1])
  rings,missing=osm.assemble([['a','b'],['b','c']])
  self.assertEqual(rings,[]);self.assertEqual(missing,1)
 def test_multipolygon_members_are_not_duplicated_and_metadata_is_minimal(self):
  nodes=''.join('<node id="%s" lon="%s" lat="%s" />'%p for p in [('1',114.131,22.247),('2',114.132,22.247),('3',114.132,22.248),('4',114.131,22.248)])
  xml='<osm><bounds minlon="114.13" minlat="22.246" maxlon="114.143" maxlat="22.258"/>'+nodes+'''<way id="10" user="someone" uid="7"><nd ref="1"/><nd ref="2"/><nd ref="3"/><nd ref="4"/><nd ref="1"/><tag k="building" v="yes"/></way><relation id="20"><member type="way" ref="10" role="outer"/><tag k="type" v="multipolygon"/><tag k="building" v="yes"/><tag k="name:en" v="Test house"/><tag k="name" v="Test house"/></relation><relation id="21"><member type="way" ref="999" role="outer"/><tag k="type" v="multipolygon"/><tag k="building" v="yes"/></relation></osm>'''
  with tempfile.TemporaryDirectory() as td:
   f=Path(td)/'sample.osm';f.write_text(xml);result=osm.convert(f)
  self.assertEqual([f['id'] for f in result['features']],['relation/20'])
  self.assertEqual(result['places'][0]['reference'],'area-centre')
  self.assertEqual(result['stats']['skippedIncompleteRelations'],['relation/21'])
  self.assertNotIn('someone',str(result))

if __name__=='__main__':unittest.main()
