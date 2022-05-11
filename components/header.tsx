import { useRouter } from 'next/router';
import React, { FunctionComponent } from 'react';
import { Menu, Container, Dropdown, Segment, Icon, SemanticICONS } from 'semantic-ui-react';
import { NavigationData } from '../common/site';
import osu from '../images/osu.png';

const MenuItemLink: FunctionComponent<{
	link: string;
	text: string;
}> = ({ link, text }) => {
	const router = useRouter();
	return <>
		<Menu.Item
			className="menu-item-link"
			active={router.pathname === link}
			as='a'
			name={text}
			href={link}
			style={{ textAlign: 'center', height: '100%', flexShrink: 1, paddingTop: 0 }}
		>
			{text}
		</Menu.Item>
		<style jsx>{`
			.menu-item-link {
				border-left: 1px solid grey;
			}
		`}</style>
	</>;
};

const MenuItemIconLink: FunctionComponent<{
	link: string;
	icon: SemanticICONS;
}> = ({ link, icon }) => {
	const router = useRouter();
	return <>
		<Menu.Item
			className="menu-item-link"
			active={router.pathname === link}
			as='a'
			href={link}
			style={{ textAlign: 'center', height: '100%', flexShrink: 1 }}
		>
			<Icon size="large" name={icon}/>
		</Menu.Item>
		<style jsx>{`
			.menu-item-link {
				border-left: 1px solid grey;
			}
		`}</style>
	</>;
};

const MenuItemDropdown: FunctionComponent<{
	text: string;
	items: {
		link: string;
		text: string;
	}[];
}> = ({ text, items }) => {
	const router = useRouter();
	const active = items.reduce(
		(tf, x) => tf || x.link === router.pathname,
		false
	);
	return <>
		<Dropdown
			item
			floating
			style={{ flexShrink: 1, height: '100%', padding: 0, border: 0 }}
			icon={
				<div className="menu-item-dropdown-icon">
					<Icon name='dropdown' style={{ margin: 0, visibility: active ? 'hidden' : '' }} />
				</div>
			}
			trigger={
				<Menu.Item
					active={active}
					as='a'
					name={text}
					style={{
						textAlign: 'center',
						height: '100%',
						flexShrink: 1,
						paddingTop: 0
					}}
				>
					{text}
				</Menu.Item>
			}
		>
			<Dropdown.Menu>
				{items.map((x) => (
					<Dropdown.Item as="a" href={x.link} key={x.text}  text={x.text} active={x.link === router.pathname} />
				))}
			</Dropdown.Menu>
		</Dropdown>
		<style jsx>{`
			@media only screen and (min-width: 992px) {
				.menu-item-dropdown-icon {
					position: relative;
					margin: 0;
					left: -50%; 
					bottom: -50%;
				}
			}
		`}</style>
	</>;
};

const Header: FunctionComponent<{
	navigation: NavigationData[];
}> = ({ navigation }) => {
	return <>
		<Segment inverted attached>
			<Menu secondary pointing stackable inverted>
				<Container>
					<div className='logo'>
						<img className='osu' src={osu} />
					</div>
					<MenuItemIconLink link='/' icon='home' />
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
				width: 131.4px;
				height: 42px;
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
					width: 175.2px
					height: 56px;
					margin: auto;
				}
			}
		`}</style>
	</>;
};

export default Header;
