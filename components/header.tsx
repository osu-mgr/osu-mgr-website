import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FunctionComponent } from 'react';
import { Menu, Container, Dropdown, Segment } from 'semantic-ui-react';
import { NavigationData } from '../common/site';

const MenuItemLink: FunctionComponent<{
	link: string;
	text: string;
}> = ({ link, text }) => {
	const router = useRouter();
	return (
		<Link href={link}>
			<Menu.Item
				active={router.pathname === link}
				as='a'
				name={text}
				style={{ textAlign: 'center', height: '100%', flexShrink: 1 }}
			>
				{text}
			</Menu.Item>
		</Link>
	);
};

const MenuItemDropdown: FunctionComponent<{
	text: string;
	items: {
		link: string;
		text: string;
	}[];
}> = ({ text, items }) => {
	const router = useRouter();
	return (
		<Dropdown
			item
			floating
			style={{ flexShrink: 1, height: '100%', padding: 0, border: 0 }}
			trigger={
				<Menu.Item
					active={items.reduce(
						(tf, x) => tf || x.link === router.pathname,
						false
					)}
					as='a'
					name={text}
					style={{
						textAlign: 'center',
						height: '100%',
						flexShrink: 1,
						marginRight: 'calc(-1em - 7.5px)',
					}}
				>
					{text}
				</Menu.Item>
			}
		>
			<Dropdown.Menu>
				{items.map((x) => (
					<Link href={x.link} key={x.text}>
						<Dropdown.Item text={x.text} active={x.link === router.pathname} />
					</Link>
				))}
			</Dropdown.Menu>
		</Dropdown>
	);
};

const Header: FunctionComponent<{
	navigation: NavigationData[];
}> = ({ navigation }) => {
	return (
		<>
			<Segment inverted attached>
				<Menu secondary pointing stackable inverted>
					<Container>
						<div className='logo'>
							<img className='osu' src='/osu.png' />
						</div>
						<MenuItemLink link='/' text='Home' />
						{navigation &&
							navigation.map((item) => {
								if (item.menu)
									return (
										<MenuItemDropdown
											key={item.id}
											text={item.text}
											items={item.menu}
										/>
									);
								if (item.link)
									return (
										<MenuItemLink
											key={item.id}
											text={item.text}
											link={item.link}
										/>
									);
							})}
					</Container>
				</Menu>
			</Segment>
			<style jsx>{`
				.logo {
					height: 100%;
					padding-right: 1em;
					margin: auto 1em auto 0;
					border-right: 1px solid white;
					display: flex;
					align-items: center;
				}

				.osu {
					height: 3em;
				}

				@media only screen and (max-width: 991px) {
					.logo {
						height: 100%;
						padding: 0;
						border: 0;
						margin: auto auto 1em auto;
						display: flex;
						align-items: center;
					}

					.osu {
						height: 4em;
						margin: auto;
					}
				}
			`}</style>
		</>
	);
};

export default Header;
